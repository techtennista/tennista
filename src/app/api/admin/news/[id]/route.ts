import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

const STATUSES = new Set(["draft", "review", "scheduled", "published", "archived"]);

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await db.query(
    `
      SELECT id, slug, title, excerpt, body, hero_asset_id, status, scheduled_for,
        published_at, author_user_id, updated_at
      FROM cms_posts
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const post = result.rows[0];
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (session.role === "contributor" && post.author_user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existingResult = await db.query<{
    author_user_id: string;
    published_at: string | null;
  }>("SELECT author_user_id, published_at FROM cms_posts WHERE id = $1 LIMIT 1", [id]);
  const existing = existingResult.rows[0];
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (session.role === "contributor" && existing.author_user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const title = String(payload.title ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));
  const requestedStatus = String(payload.status ?? "draft");
  const status =
    session.role === "contributor" &&
    ["scheduled", "published", "archived"].includes(requestedStatus)
      ? "review"
      : requestedStatus;

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid publication status." }, { status: 400 });
  }

  const content = payload.content ?? { version: 1, blocks: [] };
  const publishedAt =
    status === "published"
      ? String(payload.publishedAt || existing.published_at || new Date().toISOString())
      : payload.publishedAt
        ? String(payload.publishedAt)
        : null;
  const scheduledFor =
    status === "scheduled" && payload.publishedAt ? String(payload.publishedAt) : null;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        UPDATE cms_posts
        SET slug = $2, title = $3, excerpt = $4, body = $5::jsonb,
          hero_asset_id = $6, status = $7, seo_title = $3, seo_description = $4,
          scheduled_for = $8, published_at = $9, updated_at = NOW()
        WHERE id = $1
      `,
      [
        id,
        slug,
        title,
        String(payload.excerpt ?? "").trim() || null,
        JSON.stringify(content),
        payload.coverAssetId || null,
        status,
        scheduledFor,
        status === "published" ? publishedAt : null,
      ],
    );
    await client.query(
      `
        INSERT INTO cms_post_revisions (post_id, revision_number, snapshot, created_by)
        SELECT $1, COALESCE(MAX(revision_number), 0) + 1, $2::jsonb, $3
        FROM cms_post_revisions
        WHERE post_id = $1
      `,
      [
        id,
        JSON.stringify({ title, excerpt: payload.excerpt ?? null, body: content, status }),
        session.user.id,
      ],
    );
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'update', 'post', $2, $3::jsonb)
      `,
      [session.user.id, id, JSON.stringify({ status, title, slug })],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
    }
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({ id, slug });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "contributor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const deleted = await client.query("DELETE FROM cms_posts WHERE id = $1 RETURNING id", [id]);
    if (!deleted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id)
        VALUES ($1, 'delete', 'post', $2)
      `,
      [session.user.id, id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return new NextResponse(null, { status: 204 });
}
