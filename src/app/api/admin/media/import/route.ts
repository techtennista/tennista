import path from "node:path";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/admin-session";
import { normalizeSlug, parseContentStatus } from "@/lib/admin-content";
import { db } from "@/lib/db";
import {
  downloadImportItem,
  GoogleMediaError,
  resolveGoogleMedia,
  type ImportItem,
} from "@/lib/google-media";
import { mediaBucket, publicAssetUrl, putMediaObject } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH_SIZE = 4;

type AssetRow = {
  id: string;
  object_key: string;
  original_name: string;
  mime_type: string;
  byte_size: string;
  width: number | null;
  height: number | null;
};

function isImportItem(value: unknown): value is ImportItem {
  if (!value || typeof value !== "object") return false;
  const item = value as ImportItem;
  return (
    typeof item.id === "string" &&
    (item.source === "photos" || item.source === "drive") &&
    typeof item.filename === "string"
  );
}

function serializeAsset(row: AssetRow) {
  return {
    id: row.id,
    originalName: row.original_name,
    mimeType: row.mime_type,
    byteSize: Number(row.byte_size),
    width: row.width,
    height: row.height,
    url: publicAssetUrl(row.object_key),
  };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ message: "Unauthorised." }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return Response.json({ message: "Invalid JSON body." }, { status: 400 });

  const action = payload.action === "ingest" ? "ingest" : "resolve";

  try {
    if (action === "resolve") {
      const url = typeof payload.url === "string" ? payload.url.trim() : "";
      if (!url) return Response.json({ message: "Paste a Google Drive or Google Photos URL." }, { status: 400 });
      const resolved = await resolveGoogleMedia(url);
      return Response.json({
        title: typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : resolved.title,
        source: resolved.source.kind,
        total: resolved.items.length,
        items: resolved.items,
      });
    }

    const items = Array.isArray(payload.items) ? payload.items.filter(isImportItem).slice(0, BATCH_SIZE) : [];
    if (!items.length) {
      return Response.json({ message: "Nothing left to import." }, { status: 400 });
    }

    const createGallery = payload.createGallery === true;
    const requestedGalleryId = typeof payload.galleryId === "string" ? payload.galleryId : "";
    const title = typeof payload.title === "string" ? payload.title.trim() : "Imported gallery";
    const galleryStatus = parseContentStatus(payload.status) ?? (session.role === "contributor" ? "draft" : "published");
    if (session.role === "contributor" && !["draft", "review"].includes(galleryStatus)) {
      return Response.json({ message: "Contributors cannot publish galleries." }, { status: 403 });
    }

    const imported: ReturnType<typeof serializeAsset>[] = [];
    const failures: string[] = [];

    for (const item of items) {
      try {
        const media = await downloadImportItem(item);
        const now = new Date();
        const extension = path.extname(media.filename).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 10);
        const objectKey = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}${extension}`;
        await putMediaObject({
          objectKey,
          body: media.bytes,
          contentType: media.mimeType,
          contentLength: media.bytes.byteLength,
        });

        const result = await db.query<AssetRow>(
          `
            INSERT INTO cms_assets (
              bucket, object_key, original_name, mime_type, byte_size, width, height,
              alt_text, caption, status, uploaded_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ready', $10)
            RETURNING id, object_key, original_name, mime_type, byte_size, width, height
          `,
          [
            mediaBucket,
            objectKey,
            media.filename,
            media.mimeType,
            media.bytes.byteLength,
            media.width,
            media.height,
            title,
            `Imported from ${item.source === "photos" ? "Google Photos" : "Google Drive"}`,
            session.user.id,
          ],
        );
        imported.push(serializeAsset(result.rows[0]));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "One file could not be imported.");
      }
    }

    let galleryId = requestedGalleryId || null;
    const imageAssets = imported.filter((asset) => asset.mimeType.startsWith("image/"));
    if (createGallery && imageAssets.length) {
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        if (!galleryId) {
          const slug = `${normalizeSlug(title) || "imported-gallery"}-${randomUUID().slice(0, 8)}`;
          const created = await client.query<{ id: string }>(
            `
              INSERT INTO cms_galleries (
                id, slug, title, description, cover_asset_id, status, published_at, created_by
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id
            `,
            [
              randomUUID(),
              slug,
              title,
              `Imported from Google ${payload.source === "drive-folder" || payload.source === "drive-file" ? "Drive" : "Photos"}.`,
              imageAssets[0]?.id ?? null,
              galleryStatus,
              galleryStatus === "published" ? new Date() : null,
              session.user.id,
            ],
          );
          galleryId = created.rows[0].id;
        }
        const existing = await client.query<{ sort_order: number }>(
          `SELECT COALESCE(MAX(sort_order), -1) AS sort_order FROM cms_gallery_items WHERE gallery_id = $1`,
          [galleryId],
        );
        let sortOrder = Number(existing.rows[0]?.sort_order ?? -1) + 1;
        for (const asset of imageAssets) {
          await client.query(
            `
              INSERT INTO cms_gallery_items (gallery_id, asset_id, caption, sort_order)
              VALUES ($1, $2, NULL, $3)
              ON CONFLICT DO NOTHING
            `,
            [galleryId, asset.id, sortOrder],
          );
          sortOrder += 1;
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return Response.json({
      assets: imported,
      failures,
      galleryId,
      imported: imported.length,
    });
  } catch (error) {
    console.error("Unable to import Google media", error);
    const message =
      error instanceof GoogleMediaError
        ? error.message
        : "Unable to import that Google link. Check that it is public and try again.";
    return Response.json({ message }, { status: error instanceof GoogleMediaError ? 422 : 500 });
  }
}
