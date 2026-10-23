import { getAdminSession } from "@/lib/admin-session";
import {
  isUuid,
  normalizeSlug,
  optionalText,
  parseContentStatus,
  parsePublishedAt,
} from "@/lib/admin-content";
import { db } from "@/lib/db";

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
    const assetId = String((item as Record<string, unknown>).assetId ?? "");
    if (!isUuid(assetId) || seen.has(assetId)) return null;
    seen.add(assetId);
    items.push({
      assetId,
      caption: optionalText((item as Record<string, unknown>).caption),
      sortOrder,
    });
  }
  return items;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.query(
    `
      SELECT g.id, g.slug, g.title, g.description, g.cover_asset_id, g.status,
        g.published_at, g.created_by, g.created_at, g.updated_at,
        COUNT(gi.asset_id)::INTEGER AS item_count
      FROM cms_galleries g
      LEFT JOIN cms_gallery_items gi ON gi.gallery_id = g.id
      WHERE ($1::BOOLEAN = FALSE OR (g.created_by = $2 AND g.status IN ('draft', 'review')))
      GROUP BY g.id
      ORDER BY g.updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );
  return Response.json({ galleries: result.rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

  const publishedAt = parsePublishedAt(payload.publishedAt, status);
  if (status === "published" && !publishedAt) {
    return Response.json({ error: "Invalid publish date." }, { status: 400 });
  }

  const assetIds = [...new Set([coverAssetId, ...items.map((item) => item.assetId)].filter(Boolean))] as string[];
  const id = crypto.randomUUID();
  const afterState = {
    id,
    slug,
    title,
    description: optionalText(payload.description),
    coverAssetId,
    status,
    publishedAt,
    items,
  };

  const client = await db.connect();
  try {
    await client.query("BEGIN");
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
    await client.query(
      `
        INSERT INTO cms_galleries (
          id, slug, title, description, cover_asset_id, status, published_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        slug,
        title,
        optionalText(payload.description),
        coverAssetId,
        status,
        publishedAt,
        session.user.id,
      ],
    );
    for (const item of items) {
      await client.query(
        `
          INSERT INTO cms_gallery_items (gallery_id, asset_id, caption, sort_order)
          VALUES ($1, $2, $3, $4)
        `,
        [id, item.assetId, item.caption, item.sortOrder],
      );
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'create', 'gallery', $2, $3::JSONB)
      `,
      [session.user.id, id, JSON.stringify(afterState)],
    );
    await client.query("COMMIT");
    return Response.json({ id, slug }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to create gallery", error);
    return Response.json({ error: "Unable to create gallery." }, { status: 500 });
  } finally {
    client.release();
  }
}
