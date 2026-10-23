import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const count = await db.query<{ total: string }>(
    `SELECT COUNT(*)::TEXT AS total FROM cms_submissions WHERE status = 'new'`,
  );
  const newFormsCount = Number(count.rows[0]?.total ?? 0);

  return (
    <AdminShell session={session} newFormsCount={newFormsCount}>
      {children}
    </AdminShell>
  );
}
