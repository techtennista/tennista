import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AdminRole } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminSession = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: AdminRole;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const result = await db.query<{ role: AdminRole }>(
    `
      SELECT role
      FROM cms_admin_members
      WHERE auth_user_id = $1 AND active = TRUE
      LIMIT 1
    `,
    [session.user.id],
  );
  const member = result.rows[0];
  if (!member) return null;

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    role: member.role,
  };
}

export async function requireAdmin(roles?: AdminRole[]) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (roles && !roles.includes(session.role)) redirect("/admin");
  return session;
}
