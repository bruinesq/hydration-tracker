import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { computeGoalOz, type Gender } from "@/lib/goal";

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatarColor: z.string().min(1).max(20).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  heightIn: z.number().positive().max(96).optional(),
  weightLb: z.number().positive().max(600).optional(),
  goalOverrideOz: z.number().positive().max(400).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [current] = await db.select().from(users).where(eq(users.id, userId));
  if (!current) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const merged = { ...current, ...parsed.data };
  let computedGoalOz = current.computedGoalOz;
  if (parsed.data.gender || parsed.data.heightIn !== undefined || parsed.data.weightLb !== undefined) {
    computedGoalOz = computeGoalOz(merged.gender as Gender, merged.heightIn, merged.weightLb);
  }

  const [updated] = await db
    .update(users)
    .set({ ...parsed.data, computedGoalOz })
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(users).where(eq(users.id, Number(id)));
  return NextResponse.json({ ok: true });
}
