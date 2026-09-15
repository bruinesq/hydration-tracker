import { NextResponse } from "next/server";
import { db } from "@/db";
import { drinkTypes } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(drinkTypes);
  return NextResponse.json(all);
}
