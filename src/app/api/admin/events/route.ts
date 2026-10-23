import { getAdminSession } from "@/lib/admin-session";
import { validateEventPayload } from "@/lib/admin-events";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.query(
    `
      SELECT id, slug, title, summary, starts_at, ends_at, venue_name, city, country,
        status, published_at, created_by, updated_at,
        COALESCE((body->>'featured')::boolean, FALSE) AS featured
      FROM cms_events
      WHERE ($1::boolean = FALSE OR (created_by = $2 AND status = 'draft'))
      ORDER BY starts_at DESC, updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );

  return Response.json({ events: result.rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validateEventPayload(payload);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  const event = validation.value;

  if (session.role === "contributor" && event.status !== "draft") {
    return Response.json(
      { error: "Contributors may only create draft events." },
      { status: 403 },
    );
  }

  if (event.coverAssetId) {
    const asset = await db.query(
      `
        SELECT id
        FROM cms_assets
        WHERE id = $1 AND status = 'ready' AND mime_type LIKE 'image/%'
        LIMIT 1
      `,
      [event.coverAssetId],
    );
    if (!asset.rowCount) {
      return Response.json({ error: "Cover asset is not an available image." }, { status: 400 });
    }
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `
        INSERT INTO cms_events (
          slug, title, summary, body, cover_asset_id, starts_at, ends_at, venue_name,
          address, city, country, registration_url, status, published_at, created_by
        )
        VALUES (
          $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          CASE WHEN $13 = 'published' THEN NOW() ELSE NULL END,
          $14
        )
        RETURNING *
      `,
      [
        event.slug,
        event.title,
        event.summary,
        JSON.stringify(event.content),
        event.coverAssetId,
        event.startsAt,
        event.endsAt,
        event.venueName,
        event.address,
        event.city,
        event.country,
        event.registrationUrl,
        event.status,
        session.user.id,
      ],
    );
    const created = result.rows[0];

    await client.query(
      `
        INSERT INTO cms_audit_log (
          actor_user_id, action, entity_type, entity_id, after_state
        )
        VALUES ($1, 'create', 'event', $2, $3::jsonb)
      `,
      [session.user.id, created.id, JSON.stringify(created)],
    );
    await client.query("COMMIT");

    return Response.json(
      { id: created.id, slug: created.slug },
      { status: 201 },
    );
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to create event", error);
    return Response.json({ error: "Unable to create event." }, { status: 500 });
  } finally {
    client.release();
  }
}
