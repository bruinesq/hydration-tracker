import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { logs, users } from "@/db/schema";

/**
 * GET /api/summary/:userId
 * Returns { goal, days: [{ date, totalOz }, ...] } for the last 30 days
 * that have at least one log entry, most recent first.
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

  const allLogs = await db.select().from(logs).where(eq(logs.userId, uid));

  const byDay = new Map<string, number>();
  for (const l of allLogs) {
    const day = new Date(l.loggedAt).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + l.ozAmount);
  }

  const days = Array.from(byDay.entries())
    .map(([date, totalOz]) => ({ date, totalOz: Math.round(totalOz * 10) / 10 }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);

  const goal = user.goalOverrideOz ?? user.computedGoalOz;
  return NextResponse.json({ goal, days });
}
