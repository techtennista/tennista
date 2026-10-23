import { getAdminSession } from "@/lib/admin-session";
import {
  isContributorEditable,
  isUuid,
  normalizeSlug,
  optionalText,
  parseContentStatus,
  parsePublishedAt,
} from "@/lib/admin-content";
import { db } from "@/lib/db";

type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_asset_id: string | null;
  status: string;
  published_at: Date | null;
  created_by: string;
};

type GalleryItemInput = {
  assetId: string;
  caption: string | null;
  sortOrder: number;
};

function parseItems(value: unknown): GalleryItemInput[] | null {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const items: GalleryItemInput[] = [];
  for (const [sortOrder, item] of value.entries()) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const assetId = String(record.assetId ?? "");
    if (!isUuid(assetId) || seen.has(assetId)) return null;
    seen.add(assetId);
    items.push({ assetId, caption: optionalText(record.caption), sortOrder });
  }
  return items;
}

function canAccessContributor(
  session: { role: string; user: { id: string } },
  gallery: GalleryRow,
) {
  return (
    session.role !== "contributor" ||
    (gallery.created_by === session.user.id && isContributorEditable(gallery.status))
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Gallery not found." }, { status: 404 });
  const [galleryResult, itemResult] = await Promise.all([
    db.query<GalleryRow>(
      `
        SELECT id, slug, title, description, cover_asset_id, status, published_at, created_by
        FROM cms_galleries
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    ),
    db.query(
      `
        SELECT asset_id, caption, sort_order
        FROM cms_gallery_items
        WHERE gallery_id = $1
        ORDER BY sort_order, asset_id
      `,
      [id],
    ),
  ]);
  const gallery = galleryResult.rows[0];
  if (!gallery) return Response.json({ error: "Gallery not found." }, { status: 404 });
  if (!canAccessContributor(session, gallery)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json({ gallery: { ...gallery, items: itemResult.rows } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Gallery not found." }, { status: 404 });
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return Response.json({ error: "Invalid JSON body." }, { status: 400 });

  const title = String(payload.title ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));
  const status = parseContentStatus(payload.status);
  const coverAssetId = payload.coverAssetId ? String(payload.coverAssetId) : null;
  const items = parseItems(payload.items);
  if (!title || !slug) {
    return Response.json({ error: "Title and slug are required." }, { status: 400 });
  }
  if (!status) return Response.json({ error: "Invalid publication status." }, { status: 400 });
  if (session.role === "contributor" && !["draft", "review"].includes(status)) {
    return Response.json({ error: "Contributors cannot publish or archive galleries." }, { status: 403 });
  }
  if ((coverAssetId && !isUuid(coverAssetId)) || !items) {
    return Response.json({ error: "Invalid gallery assets." }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query<GalleryRow>(
      `
        SELECT id, slug, title, description, cover_asset_id, status, published_at, created_by
        FROM cms_galleries
        WHERE id = $1
        FOR UPDATE
      `,
      [id],
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Gallery not found." }, { status: 404 });
    }
    if (!canAccessContributor(session, existing)) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const publishedAt = parsePublishedAt(payload.publishedAt, status, existing.published_at);
    if (status === "published" && !publishedAt) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Invalid publish date." }, { status: 400 });
    }
    const assetIds = [
      ...new Set([coverAssetId, ...items.map((item) => item.assetId)].filter(Boolean)),
    ] as string[];
    if (assetIds.length) {
      const assets = await client.query(
        `
          SELECT id
          FROM cms_assets
          WHERE id = ANY($1::UUID[]) AND status = 'ready' AND mime_type LIKE 'image/%'
        `,
        [assetIds],
      );
      if (assets.rowCount !== assetIds.length) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Every gallery asset must be a ready image." }, { status: 422 });
      }
    }

    const previousItems = await client.query(
      `
        SELECT asset_id, caption, sort_order
        FROM cms_gallery_items
        WHERE gallery_id = $1
        ORDER BY sort_order, asset_id
      `,
      [id],
    );
    const beforeState = { ...existing, items: previousItems.rows };
    await client.query(
      `
        UPDATE cms_galleries
        SET slug = $2, title = $3, description = $4, cover_asset_id = $5,
          status = $6, published_at = $7
        WHERE id = $1
      `,
      [
        id,
        slug,
        title,
        optionalText(payload.description),
        coverAssetId,
        status,
        publishedAt,
      ],
    );
    await client.query("DELETE FROM cms_gallery_items WHERE gallery_id = $1", [id]);
    for (const item of items) {
      await client.query(
        `
          INSERT INTO cms_gallery_items (gallery_id, asset_id, caption, sort_order)
          VALUES ($1, $2, $3, $4)
        `,
        [id, item.assetId, item.caption, item.sortOrder],
      );
    }
    const afterState = {
      id,
      slug,
      title,
      description: optionalText(payload.description),
      coverAssetId,
      status,
      publishedAt,
      createdBy: existing.created_by,
      items,
    };
    await client.query(
      `
        INSERT INTO cms_audit_log (
          actor_user_id, action, entity_type, entity_id, before_state, after_state
        )
        VALUES ($1, 'update', 'gallery', $2, $3::JSONB, $4::JSONB)
      `,
      [session.user.id, id, JSON.stringify(beforeState), JSON.stringify(afterState)],
    );
    await client.query("COMMIT");
    return Response.json({ id, slug });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to update gallery", error);
    return Response.json({ error: "Unable to update gallery." }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "contributor") {
    return Response.json({ error: "Contributors cannot delete galleries." }, { status: 403 });
  }

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Gallery not found." }, { status: 404 });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const [galleryResult, itemResult] = await Promise.all([
      client.query<GalleryRow>(
        `
          SELECT id, slug, title, description, cover_asset_id, status, published_at, created_by
          FROM cms_galleries
          WHERE id = $1
          FOR UPDATE
        `,
        [id],
      ),
      client.query(
        `
          SELECT asset_id, caption, sort_order
          FROM cms_gallery_items
          WHERE gallery_id = $1
          ORDER BY sort_order, asset_id
        `,
        [id],
      ),
    ]);
    const existing = galleryResult.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Gallery not found." }, { status: 404 });
    }
    await client.query("DELETE FROM cms_galleries WHERE id = $1", [id]);
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, before_state)
        VALUES ($1, 'delete', 'gallery', $2, $3::JSONB)
      `,
      [session.user.id, id, JSON.stringify({ ...existing, items: itemResult.rows })],
    );
    await client.query("COMMIT");
    return new Response(null, { status: 204 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to delete gallery", error);
    return Response.json({ error: "Unable to delete gallery." }, { status: 500 });
  } finally {
    client.release();
  }
}
