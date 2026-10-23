import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin-session";

export const metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <section className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[1.25rem] border border-blue/10 bg-white p-7 sm:p-9">
        <img src="/tennista-logo.png" alt="Tennista Foundation" className="h-14 w-auto" />
        <h1 className="headline mt-8 text-[2.5rem] leading-[0.9] text-blue">Admin sign in</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-gray">
          Sign in with your authorised Tennista staff account.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-gray">Loading sign-in…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
