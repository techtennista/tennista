"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { roleLabel, type AdminRole, type TeamInvite, type TeamMember } from "@/lib/admin-roles";

export function TeamManager({
  members,
  invites,
  canManage,
  currentUserId,
}: {
  members: TeamMember[];
  invites: TeamInvite[];
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  async function refresh() {
    router.refresh();
  }

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    setInviteUrl("");
    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const payload = (await response.json()) as { error?: string; emailed?: boolean; inviteUrl?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to send that invite.");
      return;
    }
    setEmail("");
    setInviteUrl(payload.inviteUrl ?? "");
    setNotice(
      payload.emailed
        ? "Invite sent. They’ll get an email with a setup link."
        : "Invite created, but email could not be sent. Copy the link below and share it directly.",
    );
    await refresh();
  }

  async function run(path: string, method: string, body?: unknown) {
    setError("");
    setNotice("");
    const response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = (await response.json()) as { error?: string; emailed?: boolean; inviteUrl?: string };
    if (!response.ok) {
      setError(payload.error ?? "That action failed.");
      return;
    }
    if (payload.inviteUrl) {
      setInviteUrl(payload.inviteUrl);
      setNotice(
        payload.emailed ? "Invite resent." : "Invite refreshed. Copy the new link below if the email did not go out.",
      );
    }
    await refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {canManage ? (
        <form onSubmit={invite} className="rounded-[1rem] border border-blue/10 bg-white p-6">
          <h2 className="text-lg font-bold text-blue">Invite a teammate</h2>
          <p className="mt-2 text-sm text-blue/60">
            They’ll get an email, set their own name and password, then land in admin.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
            <label className="block">
              <span className="text-sm font-bold text-blue">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 px-4 text-gray outline-none focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-blue">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 bg-white px-3 text-gray outline-none focus:border-blue-bright"
              >
                <option value="super_admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="contributor">Contributor</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="h-12 self-end cursor-pointer rounded-full bg-blue px-6 font-bold text-white transition hover:bg-blue-bright disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {notice ? <p className="text-sm font-medium text-blue">{notice}</p> : null}
      {inviteUrl ? (
        <p className="break-all rounded-[0.75rem] bg-blue-tint px-4 py-3 text-sm text-blue">
          Setup link: {inviteUrl}
        </p>
      ) : null}

      <section className="rounded-[1rem] border border-blue/10 bg-white p-6">
        <h2 className="text-lg font-bold text-blue">People with access</h2>
        <ul className="mt-5 divide-y divide-blue/10">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold text-blue">{member.display_name || member.email}</p>
                <p className="text-sm text-blue/60">
                  {member.email} · {roleLabel(member.role)}
                  {member.active ? "" : " · deactivated"}
                </p>
              </div>
              {canManage && member.auth_user_id !== currentUserId ? (
                <button
                  type="button"
                  onClick={() => run(`/api/admin/team/members/${member.id}`, "PATCH", { active: !member.active })}
                  className="cursor-pointer text-sm font-bold text-blue hover:text-blue-bright"
                >
                  {member.active ? "Deactivate" : "Reactivate"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1rem] border border-blue/10 bg-white p-6">
        <h2 className="text-lg font-bold text-blue">Open invites</h2>
        {invites.length === 0 ? (
          <p className="mt-4 text-sm text-blue/60">No pending invites.</p>
        ) : (
          <ul className="mt-5 divide-y divide-blue/10">
            {invites.map((invite) => (
              <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-blue">{invite.email}</p>
                  <p className="text-sm text-blue/60">
                    {roleLabel(invite.role)} · expires {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => run(`/api/admin/team/invites/${invite.id}`, "POST")}
                      className="cursor-pointer text-sm font-bold text-blue hover:text-blue-bright"
                    >
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => run(`/api/admin/team/invites/${invite.id}`, "DELETE")}
                      className="cursor-pointer text-sm font-bold text-red-700 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
