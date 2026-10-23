import Link from "next/link";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";
import { getOpenInviteByToken } from "@/lib/admin-invites";

export const metadata = {
  title: "Join the admin team",
};

export default async function AdminJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const invite = token ? await getOpenInviteByToken(token) : null;

  return (
    <section className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[1.25rem] border border-blue/10 bg-white p-7 sm:p-9">
        <img src="/tennista-logo.png" alt="Tennista Foundation" className="h-14 w-auto" />
        <h1 className="headline mt-8 text-[2.5rem] leading-[0.9] text-blue">Set up your account</h1>
        {invite && token ? (
          <>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-gray">
              Choose the name and password you’ll use to maintain the Tennista site.
            </p>
            <AcceptInviteForm token={token} email={invite.email} role={invite.role} />
          </>
        ) : (
          <>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-gray">
              This invite is invalid or has expired. Ask an admin to send a new one.
            </p>
            <Link href="/admin/login" className="mt-8 inline-flex font-bold text-blue hover:text-blue-bright">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
