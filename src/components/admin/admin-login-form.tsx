"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const nextPath = searchParams.get("next");
  const destination = nextPath?.startsWith("/admin") ? nextPath : "/admin";

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "Unable to sign in.");
          setPending(false);
          return;
        }
        router.replace(destination);
        router.refresh();
      }}
    >
      <label className="block">
        <span className="text-sm font-bold text-blue">Email address</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 bg-white px-4 text-gray outline-none transition focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-blue">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={12}
          className="mt-2 h-12 w-full rounded-[0.75rem] border border-blue/15 bg-white px-4 text-gray outline-none transition focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
