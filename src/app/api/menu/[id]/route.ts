// API menu/[id]/route.tsx

import db from "@/src/app/lib/prismaClient";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  const updated = await db.menuItem.update({
    where: { id },
    data: data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
