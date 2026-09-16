import { NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { logs, users } from "@/db/schema";

const HISTORY_WINDOW_DAYS = 90;

/**
 * GET /api/summary/:userId
 *
 * Returns { goal, entries: [{ ozAmount, loggedAt }, ...] } for roughly the
 * last 90 days. Deliberately does NOT bucket into calendar days here - the
 * server doesn't know the caller's timezone, so day-bucketing happens
 * client-side (see src/lib/date.ts#localDateKey) against the browser's own
 * local calendar. Otherwise a log made in the evening could land on the
 * wrong day for a user west of UTC.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const uid = Number(userId);

  const [user] = await db.select().from(users).where(eq(users.id, uid));
  if (!user) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const windowStart = new Date(Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const entries = await db
    .select({ ozAmount: logs.ozAmount, loggedAt: logs.loggedAt })
    .from(logs)
    .where(and(eq(logs.userId, uid), gte(logs.loggedAt, windowStart)));

  const goal = user.goalOverrideOz ?? user.computedGoalOz;
  return NextResponse.json({ goal, entries });
}
