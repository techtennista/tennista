"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AdminSignOut() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="cursor-pointer text-sm font-bold text-white/75 transition hover:text-lime"
    >
      Sign out
    </button>
  );
}
