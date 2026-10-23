import Link from "next/link";
import type { AdminSession } from "@/lib/admin-session";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";

export function AdminShell({
  session,
  newFormsCount = 0,
  children,
}: {
  session: AdminSession;
  newFormsCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="bg-blue px-6 py-6 text-white lg:sticky lg:top-0 lg:h-dvh">
        <Link href="/admin" className="inline-flex items-center gap-3">
          <img src="/tennista-logo.png" alt="Tennista Foundation" className="h-11 w-auto" />
          <span className="headline text-[1.25rem] leading-none text-white">Admin</span>
        </Link>
        <AdminNav newFormsCount={newFormsCount} role={session.role} />
        <div className="mt-10 border-t border-white/15 pt-5 lg:absolute lg:right-6 lg:bottom-6 lg:left-6">
          <p className="truncate text-sm font-bold">{session.user.name}</p>
          <p className="mt-1 truncate text-xs text-white/60">{session.user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-lime">{session.role.replace("_", " ")}</p>
          <div className="mt-4">
            <AdminSignOut />
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-blue/10 bg-white px-5 sm:px-8">
          <p className="text-sm font-semibold text-gray">Tennista content management</p>
          <Link href="/" className="text-sm font-bold text-blue transition hover:text-blue-bright">
            View website
          </Link>
        </header>
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
