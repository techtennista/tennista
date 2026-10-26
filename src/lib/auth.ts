import "server-only";

import { betterAuth } from "better-auth";
import type { AdminRole } from "@/lib/admin-roles";
import { AUTH_COOKIE_PREFIX } from "@/lib/auth-cookie";
import { db } from "@/lib/db";

export type { AdminRole };

const allowedAdminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const authSecret = process.env.BETTER_AUTH_SECRET;

if (process.env.NODE_ENV === "production" && !isProductionBuild && !authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

const fallbackAuthUrl =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.URL?.trim() ||
  "http://localhost:3000";

const productionHosts = [
  "tennistafoundation.org",
  "www.tennistafoundation.org",
  "tennistafoundation.netlify.app",
  "*.netlify.app",
  "localhost:*",
  "127.0.0.1:*",
];

export const auth = betterAuth({
  appName: "Tennista Admin",
  database: db,
  secret: authSecret ?? "6d53fb978f1648589068a6b7c6b1f64a69d3c01897a940d09e2a743f862084b2",
  // Allow the custom domain, www, and Netlify hostnames. A single static
  // BETTER_AUTH_URL of *.netlify.app rejects origin https://tennistafoundation.org.
  baseURL: {
    allowedHosts: productionHosts,
    protocol: "auto",
    fallback: fallbackAuthUrl,
  },
  trustedOrigins: [
    "https://tennistafoundation.org",
    "https://www.tennistafoundation.org",
    "https://tennistafoundation.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.AUTH_BOOTSTRAP !== "true",
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!allowedAdminEmails.has(user.email.toLowerCase())) return false;
          return { data: user };
        },
        after: async (user) => {
          await db.query(
            `
              INSERT INTO cms_admin_members (auth_user_id, email, display_name, role)
              VALUES ($1, $2, $3, 'super_admin')
              ON CONFLICT (auth_user_id) DO NOTHING
            `,
            [user.id, user.email.toLowerCase(), user.name],
          );
        },
      },
    },
  },
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    useSecureCookies: process.env.NODE_ENV === "production",
    trustedProxyHeaders: true,
    database: {
      validateSchema: false,
    },
  },
});

