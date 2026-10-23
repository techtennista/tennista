import { redirect } from "next/navigation";
import { TeamManager } from "@/components/admin/team-manager";
import { listOpenInvites, listTeamMembers } from "@/lib/admin-invites";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team",
};

export default async function AdminTeamPage() {
  const session = await requireAdmin();
  if (session.role === "contributor") redirect("/admin");

  const [members, invites] = await Promise.all([listTeamMembers(), listOpenInvites()]);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Access</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">Team</h1>
      <p className="mt-2 max-w-2xl text-sm text-blue/60">
        Invite editors and admins to maintain the site. They set up their own account from the email we send.
      </p>
      <TeamManager
        members={members}
        invites={invites}
        canManage={session.role === "super_admin"}
        currentUserId={session.user.id}
      />
    </div>
  );
}
