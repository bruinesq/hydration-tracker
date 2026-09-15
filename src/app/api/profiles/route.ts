import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { computeGoalOz } from "@/lib/goal";

export const MAX_PROFILES = 4;

const createSchema = z.object({
  name: z.string().min(1).max(50),
  avatarColor: z.string().min(1).max(20).default("#38bdf8"),
  gender: z.enum(["male", "female", "other"]),
  heightIn: z.number().positive().max(96),
  weightLb: z.number().positive().max(600),
});

export async function GET() {
  const all = await db.select().from(users).orderBy(users.createdAt);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.select().from(users);
  if (existing.length >= MAX_PROFILES) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_PROFILES} profiles reached.` },
      { status: 400 }
    );
  }

  const { name, avatarColor, gender, heightIn, weightLb } = parsed.data;
  const computedGoalOz = computeGoalOz(gender, heightIn, weightLb);

  const [created] = await db
    .insert(users)
    .values({ name, avatarColor, gender, heightIn, weightLb, computedGoalOz })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
