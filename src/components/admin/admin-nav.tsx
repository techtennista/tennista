"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/admin-roles";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "News", href: "/admin/news" },
  { label: "Media", href: "/admin/media" },
  { label: "Galleries", href: "/admin/galleries" },
  { label: "Videos", href: "/admin/videos" },
  { label: "Events", href: "/admin/events" },
  { label: "Tennis Courts", href: "/admin/courts" },
  { label: "Forms", href: "/admin/submissions", badgeKey: "forms" as const },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/submissions") {
    return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith("/admin/forms");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  newFormsCount = 0,
  role,
}: {
  newFormsCount?: number;
  role?: AdminRole;
}) {
  const pathname = usePathname();
  const items = [
    ...adminNav,
    ...(role && role !== "contributor" ? ([{ label: "Team", href: "/admin/team" }] as const) : []),
  ];

  return (
    <nav aria-label="Admin" className="mt-10">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = "badgeKey" in item && item.badgeKey === "forms" && newFormsCount > 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[0.65rem] px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-white text-blue" : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <span>{item.label}</span>
                {showBadge ? (
                  <span
                    className={cn(
                      "min-w-6 rounded-full px-2 py-0.5 text-center text-[0.7rem] font-bold",
                      active ? "bg-blue text-white" : "bg-lime text-blue",
                    )}
                  >
                    {newFormsCount > 99 ? "99+" : newFormsCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
