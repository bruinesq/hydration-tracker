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
 * GET /api/logs?userId=1&dayStartMs=<epoch ms>
 *
 * `dayStartMs` should be the start of the caller's LOCAL calendar day (see
 * src/lib/date.ts#localDayStartMs), computed in the browser. The server
 * doesn't know the user's timezone, so it never guesses "today" itself -
 * if dayStartMs is omitted it falls back to the server's own local day,
 * which is only meant for quick manual testing.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const dayStartMsParam = searchParams.get("dayStartMs");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  let dayStart: Date;
  if (dayStartMsParam) {
    dayStart = new Date(Number(dayStartMsParam));
  } else {
    dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
  }
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

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
