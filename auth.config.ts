import { betterAuth } from "better-auth";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to generate the auth schema.");
}

export const auth = betterAuth({
  database: new Pool({ connectionString, max: 1 }),
  emailAndPassword: {
    enabled: true,
  },
});
