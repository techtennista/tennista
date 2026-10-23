import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

const STATUSES = new Set(["new", "in_progress", "resolved", "spam", "archived"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json()) as { status?: unknown; notes?: unknown };
  const status = String(payload.status ?? "");
  const notes = String(payload.notes ?? "").trim();
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      `
        UPDATE cms_submissions
        SET status = $2,
          payload = payload || jsonb_build_object('_adminNotes', $3::text),
          assigned_to = $4,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `,
      [id, status, notes || null, session.user.id],
    );
    if (!updated.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, entity_id, after_state)
        VALUES ($1, 'update', 'submission', $2, $3::jsonb)
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
