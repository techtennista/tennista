import { NextResponse } from "next/server";
import { roleLabel } from "@/lib/admin-roles";
import { createInvite, getOpenInviteById, revokeInvite } from "@/lib/admin-invites";
import { getAdminSession } from "@/lib/admin-session";
import { sendAdminInvite } from "@/lib/notify";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Only admins can manage invites." }, { status: 403 });
  }

  const { id } = await params;
  await revokeInvite(id);
  return NextResponse.json({ ok: true });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Only admins can manage invites." }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getOpenInviteById(id);
  if (!existing) {
    return NextResponse.json({ error: "That invite is no longer active." }, { status: 404 });
  }

  const invite = await createInvite({
    email: existing.email,
    role: existing.role,
    invitedBy: session.user.email,
  });
  const emailed = await sendAdminInvite({
    email: existing.email,
    roleLabel: roleLabel(existing.role),
    invitedBy: session.user.name || session.user.email,
    url: invite.url,
  });

  return NextResponse.json({
    ok: true,
    inviteUrl: invite.url,
    emailed: "ok" in emailed && emailed.ok,
  });
}
