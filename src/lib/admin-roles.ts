export const INVITE_ROLES = ["super_admin", "editor", "contributor"] as const;

export type AdminRole = (typeof INVITE_ROLES)[number];

export type TeamMember = {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  role: AdminRole;
  active: boolean;
  created_at: Date | string;
};

export type TeamInvite = {
  id: string;
  email: string;
  role: AdminRole;
  invited_by: string;
  expires_at: Date | string;
  created_at: Date | string;
};

export function isAdminRole(value: string): value is AdminRole {
  return (INVITE_ROLES as readonly string[]).includes(value);
}

export function roleLabel(role: AdminRole) {
  if (role === "super_admin") return "Admin";
  if (role === "editor") return "Editor";
  return "Contributor";
}
