import "server-only";

import { Pool } from "pg";

const globalForDatabase = globalThis as unknown as {
  tennistaPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }
  return new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idleTimeoutMillis: 30_000,
  });
}

export const db = globalForDatabase.tennistaPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.tennistaPool = db;
}
