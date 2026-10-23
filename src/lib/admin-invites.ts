import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { type AdminRole, type TeamInvite, type TeamMember } from "@/lib/admin-roles";
import { db } from "@/lib/db";

export const INVITE_TTL_DAYS = 7;
export type { AdminRole, TeamInvite, TeamMember };

export function appBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function inviteUrlForToken(token: string) {
  return `${appBaseUrl()}/admin/join?token=${encodeURIComponent(token)}`;
}

export async function listTeamMembers() {
  const result = await db.query<TeamMember>(
    `
      SELECT id, auth_user_id, email, display_name, role, active, created_at
      FROM cms_admin_members
      ORDER BY
        CASE role WHEN 'super_admin' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END,
        created_at ASC
    `,
  );
  return result.rows;
}

export async function listOpenInvites() {
  const result = await db.query<TeamInvite>(
    `
      SELECT id, email, role, invited_by, expires_at, created_at
      FROM cms_admin_invites
      WHERE accepted_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
    `,
  );
  return result.rows;
}

export async function findMemberByEmail(email: string) {
  const result = await db.query<{ id: string }>(
    `SELECT id FROM cms_admin_members WHERE email = $1 LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function createInvite({
  email,
  role,
  invitedBy,
}: {
  email: string;
  role: AdminRole;
  invitedBy: string;
}) {
  const token = newInviteToken();
  const tokenHash = hashInviteToken(token);
  await db.query(
    `
      UPDATE cms_admin_invites
      SET revoked_at = NOW()
      WHERE email = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
    `,
    [email],
  );
  const result = await db.query<{ id: string }>(
    `
      INSERT INTO cms_admin_invites (email, role, token_hash, invited_by, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::INTERVAL)
      RETURNING id
    `,
    [email, role, tokenHash, invitedBy, String(INVITE_TTL_DAYS)],
  );
  return {
    id: result.rows[0]?.id,
    token,
    url: inviteUrlForToken(token),
  };
}

export async function getOpenInviteById(id: string) {
  const result = await db.query<TeamInvite>(
    `
      SELECT id, email, role, invited_by, expires_at, created_at
      FROM cms_admin_invites
      WHERE id = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getOpenInviteByToken(token: string) {
  const result = await db.query<TeamInvite & { token_hash: string }>(
    `
      SELECT id, email, role, invited_by, expires_at, created_at, token_hash
      FROM cms_admin_invites
      WHERE token_hash = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [hashInviteToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function revokeInvite(id: string) {
  await db.query(
    `
      UPDATE cms_admin_invites
      SET revoked_at = NOW()
      WHERE id = $1
        AND accepted_at IS NULL
        AND revoked_at IS NULL
    `,
    [id],
  );
}

export async function acceptInvite({
  token,
  name,
  password,
}: {
  token: string;
  name: string;
  password: string;
}) {
  const invite = await getOpenInviteByToken(token);
  if (!invite) return { error: "This invite is invalid or has expired." as const };

  const existing = await findMemberByEmail(invite.email);
  if (existing) return { error: "This email already has an account. Sign in instead." as const };

  const userId = randomUUID();
  const passwordHash = await hashPassword(password);
  const accountId = randomUUID();

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO "user" (id, name, email, "emailVerified")
        VALUES ($1, $2, $3, TRUE)
      `,
      [userId, name, invite.email],
    );
    await client.query(
      `
        INSERT INTO account (id, "accountId", "providerId", "userId", password, "updatedAt")
        VALUES ($1, $2, 'credential', $3, $4, NOW())
      `,
      [accountId, userId, userId, passwordHash],
    );
    await client.query(
      `
        INSERT INTO cms_admin_members (auth_user_id, email, display_name, role)
        VALUES ($1, $2, $3, $4)
      `,
      [userId, invite.email, name, invite.role],
    );
    await client.query(
      `
        UPDATE cms_admin_invites
        SET accepted_at = NOW()
        WHERE id = $1
      `,
      [invite.id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return { email: invite.email, name };
}

export async function setMemberActive(id: string, active: boolean) {
  await db.query(
    `
      UPDATE cms_admin_members
      SET active = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [id, active],
  );
}
