import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { logs } from "@/db/schema";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(logs).where(eq(logs.id, Number(id)));
  return NextResponse.json({ ok: true });
}
