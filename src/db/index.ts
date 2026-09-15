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
