import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

const STATUSES = new Set(["pending", "published", "rejected", "archived"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "contributor") {
    return NextResponse.json({ error: "Only editors can moderate courts." }, { status: 403 });
  }

  const payload = (await request.json()) as {
    status?: unknown;
    name?: unknown;
    address?: unknown;
    city?: unknown;
    state?: unknown;
    country?: unknown;
  };
  const status = String(payload.status ?? "");
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid moderation status." }, { status: 400 });
  }

  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{ source: string; external_id: string | null }>(
      `
        UPDATE tennis_courts
        SET name = COALESCE(NULLIF($2, ''), name),
          address = COALESCE(NULLIF($3, ''), address),
          city = COALESCE(NULLIF($4, ''), city),
          state = COALESCE(NULLIF($5, ''), state),
          country = COALESCE(NULLIF($6, ''), country),
          moderation_status = $7,
          active = $7 = 'published',
          verified_at = CASE WHEN $7 = 'published' THEN NOW() ELSE verified_at END,
          verified_by = CASE WHEN $7 = 'published' THEN $8 ELSE verified_by END,
          updated_at = NOW()
        WHERE id = $1
        RETURNING source, external_id
      `,
      [
        id,
        String(payload.name ?? "").trim(),
        String(payload.address ?? "").trim(),
        String(payload.city ?? "").trim(),
        String(payload.state ?? "").trim(),
        String(payload.country ?? "").trim(),
        status,
        session.user.id,
      ],
    );
    const court = result.rows[0];
    if (!court) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Court not found." }, { status: 404 });
    }
    if (court.source === "openstreetmap" && court.external_id) {
      await client.query(
        `
          UPDATE cms_court_imports
          SET status = $3, reviewed_by = $4, reviewed_at = NOW()
          WHERE source = $1 AND external_id = $2
        `,
        [
          court.source,
          court.external_id,
          status === "published" ? "approved" : status === "rejected" ? "rejected" : "pending",
          session.user.id,
        ],
      );
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'moderate', 'tennis_court', $2, $3::jsonb)
      `,
      [session.user.id, id, JSON.stringify({ status })],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({ id, status });
}
