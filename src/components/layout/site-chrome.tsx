"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <main id="main" className="min-h-dvh bg-[#f4f7fb]">
        {children}
      </main>
    );
  }

  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main id="main" className="pt-[5.25rem]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
