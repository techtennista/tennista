import { getAdminSession } from "@/lib/admin-session";
import { parseVideoInput } from "@/lib/admin-videos";
import { db } from "@/lib/db";
import { ensureProviderThumbnailAsset } from "@/lib/provider-thumbnail";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.query(
    `
      SELECT id, slug, title, description, provider, external_url, thumbnail_asset_id,
        status, published_at, sort_order, created_by, created_at, updated_at
      FROM cms_videos
      WHERE ($1::BOOLEAN = FALSE OR (created_by = $2 AND status IN ('draft', 'review')))
      ORDER BY updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );
  return Response.json({ videos: result.rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return Response.json({ error: "Invalid JSON body." }, { status: 400 });

  const parsed = parseVideoInput(payload);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: parsed.status });
  if (session.role === "contributor" && !["draft", "review"].includes(parsed.status)) {
    return Response.json({ error: "Contributors cannot publish or archive videos." }, { status: 403 });
  }

  const id = crypto.randomUUID();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    let thumbnailAssetId = parsed.thumbnailAssetId;
    if (thumbnailAssetId) {
      const asset = await client.query(
        `
          SELECT id
          FROM cms_assets
          WHERE id = $1 AND status = 'ready' AND mime_type LIKE 'image/%'
        `,
        [thumbnailAssetId],
      );
      if (!asset.rowCount) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Thumbnail must be a ready image." }, { status: 422 });
      }
    } else {
      thumbnailAssetId = await ensureProviderThumbnailAsset({
        client,
        provider: parsed.provider,
        externalUrl: parsed.externalUrl,
        title: parsed.title,
        uploadedBy: session.user.id,
      });
    }
    if (parsed.videoAssetId) {
      const asset = await client.query(
        `
          SELECT id
          FROM cms_assets
          WHERE id = $1 AND status = 'ready' AND mime_type LIKE 'video/%'
        `,
        [parsed.videoAssetId],
      );
      if (!asset.rowCount) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Choose a ready video file." }, { status: 422 });
      }
    }
    const afterState = { id, ...parsed, thumbnailAssetId };
    await client.query(
      `
        INSERT INTO cms_videos (
          id, slug, title, description, provider, external_url, video_asset_id, thumbnail_asset_id,
          status, published_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        id,
        parsed.slug,
        parsed.title,
        parsed.description,
        parsed.provider,
        parsed.externalUrl,
        parsed.videoAssetId,
        thumbnailAssetId,
        parsed.status,
        parsed.publishedAt,
        session.user.id,
      ],
    );
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'create', 'video', $2, $3::JSONB)
      `,
      [session.user.id, id, JSON.stringify(afterState)],
    );
    await client.query("COMMIT");
    return Response.json({ id, slug: parsed.slug }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to create video", error);
    return Response.json({ error: "Unable to create video." }, { status: 500 });
  } finally {
    client.release();
  }
}
