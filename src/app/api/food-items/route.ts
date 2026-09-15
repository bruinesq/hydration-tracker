import { NextResponse } from "next/server";
import { db } from "@/db";
import { foodItems } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(foodItems);
  return NextResponse.json(all);
}
