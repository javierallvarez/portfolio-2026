import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Singleton Drizzle client for Neon serverless Postgres.
 *
 * In local development, point DATABASE_URL at a local Postgres instance.
 * In production, use a Neon connection string.
 */
function createDrizzleClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to your .env.local file. " +
        "See .env.example for reference.",
    );
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Prevent multiple instances during hot-reload in development
declare global {
  // Using `var` is required to augment the global scope in TypeScript
  var __drizzle: ReturnType<typeof createDrizzleClient> | undefined;
}

export const db =
  process.env.NODE_ENV === "production"
    ? createDrizzleClient()
    : (globalThis.__drizzle ?? (globalThis.__drizzle = createDrizzleClient()));

export { schema };
