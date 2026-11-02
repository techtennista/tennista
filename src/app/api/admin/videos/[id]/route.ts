import { getAdminSession } from "@/lib/admin-session";
import { isContributorEditable, isUuid, parsePublishedAt } from "@/lib/admin-content";
import { parseVideoInput, type VideoProvider } from "@/lib/admin-videos";
import { db } from "@/lib/db";
import { ensureProviderThumbnailAsset } from "@/lib/provider-thumbnail";

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  provider: VideoProvider;
  external_url: string | null;
  video_asset_id: string | null;
  thumbnail_asset_id: string | null;
  status: string;
  published_at: Date | null;
  sort_order: number;
  created_by: string;
};

function canAccessContributor(
  session: { role: string; user: { id: string } },
  video: VideoRow,
) {
  return (
    session.role !== "contributor" ||
    (video.created_by === session.user.id && isContributorEditable(video.status))
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Video not found." }, { status: 404 });
  const result = await db.query<VideoRow>(
    `
      SELECT id, slug, title, description, provider, external_url, video_asset_id, thumbnail_asset_id,
        status, published_at, sort_order, created_by
      FROM cms_videos
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const video = result.rows[0];
  if (!video) return Response.json({ error: "Video not found." }, { status: 404 });
  if (!canAccessContributor(session, video)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json({ video });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Video not found." }, { status: 404 });
  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return Response.json({ error: "Invalid JSON body." }, { status: 400 });

  const parsed = parseVideoInput(payload);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: parsed.status });
  if (session.role === "contributor" && !["draft", "review"].includes(parsed.status)) {
    return Response.json({ error: "Contributors cannot publish or archive videos." }, { status: 403 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query<VideoRow>(
      `
        SELECT id, slug, title, description, provider, external_url, video_asset_id, thumbnail_asset_id,
          status, published_at, sort_order, created_by
        FROM cms_videos
        WHERE id = $1
        FOR UPDATE
      `,
      [id],
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Video not found." }, { status: 404 });
    }
    if (!canAccessContributor(session, existing)) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const publishedAt = parsePublishedAt(payload.publishedAt, parsed.status, existing.published_at);
    if (parsed.status === "published" && !publishedAt) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Invalid publish date." }, { status: 400 });
    }
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
    } else if (
      !existing.thumbnail_asset_id ||
      existing.external_url !== parsed.externalUrl ||
      existing.provider !== parsed.provider
    ) {
      thumbnailAssetId = await ensureProviderThumbnailAsset({
        client,
        provider: parsed.provider,
        externalUrl: parsed.externalUrl,
        title: parsed.title,
        uploadedBy: session.user.id,
      });
      if (!thumbnailAssetId) {
        thumbnailAssetId = existing.thumbnail_asset_id;
      }
    } else {
      thumbnailAssetId = existing.thumbnail_asset_id;
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

    await client.query(
      `
        UPDATE cms_videos
        SET slug = $2, title = $3, description = $4, provider = $5, external_url = $6,
          video_asset_id = $7, thumbnail_asset_id = $8, status = $9, published_at = $10
        WHERE id = $1
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
        publishedAt,
      ],
    );
    const afterState = {
      id,
      ...parsed,
      thumbnailAssetId,
      publishedAt,
      sortOrder: existing.sort_order,
      createdBy: existing.created_by,
    };
    await client.query(
      `
        INSERT INTO cms_audit_log (
          actor_user_id, action, entity_type, entity_id, before_state, after_state
        )
        VALUES ($1, 'update', 'video', $2, $3::JSONB, $4::JSONB)
      `,
      [session.user.id, id, JSON.stringify(existing), JSON.stringify(afterState)],
    );
    await client.query("COMMIT");
    return Response.json({ id, slug: parsed.slug });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to update video", error);
    return Response.json({ error: "Unable to update video." }, { status: 500 });
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
    return Response.json({ error: "Contributors cannot delete videos." }, { status: 403 });
  }

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Video not found." }, { status: 404 });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<VideoRow>(
      `
        DELETE FROM cms_videos
        WHERE id = $1
        RETURNING id, slug, title, description, provider, external_url, thumbnail_asset_id,
          status, published_at, sort_order, created_by
      `,
      [id],
    );
    const existing = result.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Video not found." }, { status: 404 });
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, before_state)
        VALUES ($1, 'delete', 'video', $2, $3::JSONB)
      `,
      [session.user.id, id, JSON.stringify(existing)],
    );
    await client.query("COMMIT");
    return new Response(null, { status: 204 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to delete video", error);
    return Response.json({ error: "Unable to delete video." }, { status: 500 });
  } finally {
    client.release();
  }
}
