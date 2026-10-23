import { loadEnvConfig } from "@next/env";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Tennista Admin";
  const connectionString = process.env.DATABASE_URL;
  const allowedEmails = new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!connectionString) throw new Error("DATABASE_URL is required.");
  if (!email || !password) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters.");
  }
  if (!allowedEmails.has(email)) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL must also be listed in ADMIN_EMAILS.");
  }

  const pool = new Pool({ connectionString, max: 2 });
  const auth = betterAuth({
    appName: "Tennista Admin",
    database: pool,
    secret: process.env.BETTER_AUTH_SECRET ?? "bootstrap-only-secret-replace-in-production-please",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!allowedEmails.has(user.email.toLowerCase())) return false;
            return { data: user };
          },
          after: async (user) => {
            await pool.query(
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
      database: {
        validateSchema: false,
      },
    },
  });

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    console.log(`Created Tennista admin account for ${email}.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
