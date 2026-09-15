import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { logs } from "@/db/schema";

const createSchema = z.object({
  userId: z.number().int().positive(),
  entryType: z.enum(["drink", "food"]),
  referenceId: z.number().int().positive().nullable().optional(),
  label: z.string().min(1).max(80),
  ozAmount: z.number().positive().max(200),
});

/**
 * GET /api/logs?userId=1&date=YYYY-MM-DD
 * Returns that user's log entries for the given day (defaults to today,
 * using the server's local date - fine for a single-household app).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const dateStr = searchParams.get("date");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const dayStart = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const rows = await db
    .select()
    .from(logs)
    .where(and(eq(logs.userId, userId), gte(logs.loggedAt, dayStart), lt(logs.loggedAt, dayEnd)))
    .orderBy(desc(logs.loggedAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [created] = await db.insert(logs).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
