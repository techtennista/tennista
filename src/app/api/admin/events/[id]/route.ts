import { getAdminSession } from "@/lib/admin-session";
import { validateEventPayload } from "@/lib/admin-events";
import { db } from "@/lib/db";

type EventAccessRow = {
  created_by: string;
  status: string;
  published_at: Date | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await db.query(
    `
      SELECT id, slug, title, summary, body, cover_asset_id, starts_at, ends_at,
        venue_name, address, city, country, registration_url, status, published_at,
        created_by, created_at, updated_at,
        COALESCE((body->>'featured')::boolean, FALSE) AS featured
      FROM cms_events
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const event = result.rows[0];
  if (!event) return Response.json({ error: "Event not found." }, { status: 404 });
  if (
    session.role === "contributor" &&
    (event.created_by !== session.user.id || event.status !== "draft")
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ event });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existingResult = await db.query<EventAccessRow>(
    `
      SELECT created_by, status, published_at
      FROM cms_events
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const existing = existingResult.rows[0];
  if (!existing) return Response.json({ error: "Event not found." }, { status: 404 });
  if (
    session.role === "contributor" &&
    (existing.created_by !== session.user.id || existing.status !== "draft")
  ) {
    return Response.json(
      { error: "Contributors may only edit their own draft events." },
      { status: 403 },
    );
  }

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
      { error: "Contributors may only save draft events." },
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
    const beforeResult = await client.query(
      "SELECT * FROM cms_events WHERE id = $1 FOR UPDATE",
      [id],
    );
    const before = beforeResult.rows[0];
    if (!before) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Event not found." }, { status: 404 });
    }
    if (
      session.role === "contributor" &&
      (before.created_by !== session.user.id || before.status !== "draft")
    ) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Contributors may only edit their own draft events." },
        { status: 403 },
      );
    }

    const result = await client.query(
      `
        UPDATE cms_events
        SET slug = $2, title = $3, summary = $4, body = $5::jsonb,
          cover_asset_id = $6, starts_at = $7, ends_at = $8, venue_name = $9,
          address = $10, city = $11, country = $12, registration_url = $13,
          status = $14,
          published_at = CASE
            WHEN $14 = 'published' THEN COALESCE(published_at, NOW())
            ELSE NULL
          END
        WHERE id = $1
        RETURNING *
      `,
      [
        id,
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
      ],
    );
    const updated = result.rows[0];

    await client.query(
      `
        INSERT INTO cms_audit_log (
          actor_user_id, action, entity_type, entity_id, before_state, after_state
        )
        VALUES ($1, 'update', 'event', $2, $3::jsonb, $4::jsonb)
      `,
      [session.user.id, id, JSON.stringify(before), JSON.stringify(updated)],
    );
    await client.query("COMMIT");

    return Response.json({ id: updated.id, slug: updated.slug });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && "code" in error && error.code === "23505") {
      return Response.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Unable to update event", error);
    return Response.json({ error: "Unable to update event." }, { status: 500 });
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
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "DELETE FROM cms_events WHERE id = $1 RETURNING *",
      [id],
    );
    const deleted = result.rows[0];
    if (!deleted) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Event not found." }, { status: 404 });
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (
          actor_user_id, action, entity_type, entity_id, before_state
        )
        VALUES ($1, 'delete', 'event', $2, $3::jsonb)
      `,
      [session.user.id, id, JSON.stringify(deleted)],
    );
    await client.query("COMMIT");
    return new Response(null, { status: 204 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to delete event", error);
    return Response.json({ error: "Unable to delete event." }, { status: 500 });
  } finally {
    client.release();
  }
}
