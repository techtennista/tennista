import { NextResponse } from "next/server";
import { setMemberActive } from "@/lib/admin-invites";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Only admins can change team access." }, { status: 403 });
  }

  const { id } = await params;
  const payload = (await request.json()) as { active?: boolean };
  if (typeof payload.active !== "boolean") {
    return NextResponse.json({ error: "active is required." }, { status: 400 });
  }

  const member = await db.query<{ auth_user_id: string }>(
    `SELECT auth_user_id FROM cms_admin_members WHERE id = $1 LIMIT 1`,
    [id],
  );
  if (!member.rows[0]) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  if (member.rows[0].auth_user_id === session.user.id) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  await setMemberActive(id, payload.active);
  return NextResponse.json({ ok: true });
}
