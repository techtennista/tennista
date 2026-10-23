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

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.query(
    `
      SELECT p.id, p.slug, p.title, p.excerpt, p.status, p.published_at,
        p.updated_at, p.author_user_id, a.object_key AS cover_object_key
      FROM cms_posts p
      LEFT JOIN cms_assets a ON a.id = p.hero_asset_id
      ORDER BY p.updated_at DESC
    `,
  );

  return NextResponse.json({ posts: result.rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json()) as Record<string, unknown>;
  const title = String(payload.title ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));
  const requestedStatus = String(payload.status ?? "draft");
  const status =
    session.role === "contributor" && requestedStatus === "published"
      ? "review"
      : requestedStatus;

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid publication status." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const content = payload.content ?? { version: 1, blocks: [] };
  const publishedAt =
    status === "published"
      ? String(payload.publishedAt || new Date().toISOString())
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
        INSERT INTO cms_posts (
          id, slug, title, excerpt, body, hero_asset_id, status, author_user_id,
          seo_title, seo_description, scheduled_for, published_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $3, $4, $9, $10)
      `,
      [
        id,
        slug,
        title,
        String(payload.excerpt ?? "").trim() || null,
        JSON.stringify(content),
        payload.coverAssetId || null,
        status,
        session.user.id,
        scheduledFor,
        status === "published" ? publishedAt : null,
      ],
    );
    await client.query(
      `
        INSERT INTO cms_post_revisions (post_id, revision_number, snapshot, created_by)
        VALUES ($1, 1, $2::jsonb, $3)
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
        VALUES ($1, 'create', 'post', $2, $3::jsonb)
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

  return NextResponse.json({ id, slug }, { status: 201 });
}
