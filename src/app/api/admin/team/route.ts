import { NextResponse } from "next/server";
import { isAdminRole, roleLabel } from "@/lib/admin-roles";
import { createInvite, findMemberByEmail, listOpenInvites, listTeamMembers } from "@/lib/admin-invites";
import { getAdminSession } from "@/lib/admin-session";
import { sendAdminInvite } from "@/lib/notify";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "contributor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [members, invites] = await Promise.all([listTeamMembers(), listOpenInvites()]);
  return NextResponse.json({ members, invites, canManage: session.role === "super_admin" });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Only admins can invite teammates." }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const email = String(payload.email ?? "").trim().toLowerCase();
  const role = String(payload.role ?? "editor");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Choose Admin, Editor, or Contributor." }, { status: 400 });
  }

  const existing = await findMemberByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "That person already has an account." }, { status: 409 });
  }

  const invite = await createInvite({
    email,
    role,
    invitedBy: session.user.email,
  });
  const emailed = await sendAdminInvite({
    email,
    roleLabel: roleLabel(role),
    invitedBy: session.user.name || session.user.email,
    url: invite.url,
  });

  return NextResponse.json({
    ok: true,
    inviteUrl: invite.url,
    emailed: "ok" in emailed && emailed.ok,
  });
}
