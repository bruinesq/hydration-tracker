import { config } from "dotenv";
// Load .env.local ourselves (rather than relying on whoever imports this
// file to have done it first) so this works the same whether it's loaded
// by Next.js, by drizzle-kit, or directly via `tsx` (e.g. the seed script).
// In production (Render), DATABASE_URL is set directly as an env var and
// there's no .env.local file, so this call is a harmless no-op there.
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.local.example to .env.local (locally) " +
      "or set it in your Render service's environment variables (in production)."
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
