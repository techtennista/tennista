import { getAdminSession } from "@/lib/admin-session";
import {
  isUuid,
  normalizeSlug,
  optionalText,
  parseContentStatus,
  parsePublishedAt,
} from "@/lib/admin-content";
import { db } from "@/lib/db";

type VideoProvider = "youtube" | "vimeo";

function parseProvider(value: unknown): VideoProvider | null {
  return value === "youtube" || value === "vimeo" ? value : null;
}

function parseProviderUrl(value: unknown, provider: VideoProvider | null) {
  if (!provider || typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const valid =
      provider === "youtube"
        ? ["youtube.com", "youtu.be", "youtube-nocookie.com"].some(
            (domain) => host === domain || host.endsWith(`.${domain}`),
          )
        : host === "vimeo.com" || host.endsWith(".vimeo.com");
    return valid ? url.toString() : null;
  } catch {
    return null;
  }
}

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

  const title = String(payload.title ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));
  const provider = parseProvider(payload.provider);
  const externalUrl = parseProviderUrl(payload.externalUrl, provider);
  const status = parseContentStatus(payload.status);
  const thumbnailAssetId = payload.thumbnailAssetId ? String(payload.thumbnailAssetId) : null;
  if (!title || !slug) {
    return Response.json({ error: "Title and slug are required." }, { status: 400 });
  }
  if (!provider || !externalUrl) {
    return Response.json(
      { error: "Add a valid HTTPS YouTube or Vimeo URL for the selected provider." },
      { status: 400 },
    );
  }
  if (!status) return Response.json({ error: "Invalid publication status." }, { status: 400 });
  if (session.role === "contributor" && !["draft", "review"].includes(status)) {
    return Response.json({ error: "Contributors cannot publish or archive videos." }, { status: 403 });
  }
  if (thumbnailAssetId && !isUuid(thumbnailAssetId)) {
    return Response.json({ error: "Invalid thumbnail asset." }, { status: 400 });
  }

  const publishedAt = parsePublishedAt(payload.publishedAt, status);
  if (status === "published" && !publishedAt) {
    return Response.json({ error: "Invalid publish date." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const afterState = {
    id,
    slug,
    title,
    description: optionalText(payload.description),
    provider,
    externalUrl,
    thumbnailAssetId,
    status,
    publishedAt,
  };
  const client = await db.connect();
  try {
    await client.query("BEGIN");
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
    }
    await client.query(
      `
        INSERT INTO cms_videos (
          id, slug, title, description, provider, external_url, thumbnail_asset_id,
          status, published_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        id,
        slug,
        title,
        optionalText(payload.description),
        provider,
        externalUrl,
        thumbnailAssetId,
        status,
        publishedAt,
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
    return Response.json({ id, slug }, { status: 201 });
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
