"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { roleLabel, type AdminRole } from "@/lib/admin-roles";

export function AcceptInviteForm({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: AdminRole;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (password !== confirm) {
          setError("Those passwords do not match.");
          return;
        }
        setPending(true);
        setError("");
        const created = await fetch("/api/admin/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, name, password }),
        });
        const payload = (await created.json()) as { error?: string; email?: string };
        if (!created.ok) {
          setError(payload.error ?? "Unable to set up that account.");
          setPending(false);
          return;
        }
        const signedIn = await authClient.signIn.email({
          email: payload.email ?? email,
          password,
        });
        if (signedIn.error) {
          router.replace("/admin/login");
          return;
        }
        router.replace("/admin");
        router.refresh();
      }}
    >
      <p className="rounded-[0.75rem] bg-blue-tint px-4 py-3 text-sm text-blue">
        Invited as <strong>{roleLabel(role)}</strong> · {email}
      </p>
      <label className="block">
        <span className="text-sm font-bold text-blue">Your name</span>
        <input
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 px-4 text-gray outline-none focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-blue">Password</span>
        <input
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 px-4 text-gray outline-none focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
        />
        <span className="mt-1 block text-xs text-blue/50">At least 12 characters.</span>
      </label>
      <label className="block">
        <span className="text-sm font-bold text-blue">Confirm password</span>
        <input
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 px-4 text-gray outline-none focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full cursor-pointer rounded-full bg-blue px-6 font-bold text-white transition hover:bg-blue-bright disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
