import { NextRequest, NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

// PATCH /api/menu/[id]/addons/[addonId] - แก้ไข add-on
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  try {
    const { addonId } = await params;
    const data = await req.json();

    const updatedAddon = await db.menuAddon.update({
      where: { id: addonId },
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        available: data.available,
      },
    });

    return NextResponse.json(updatedAddon);
  } catch (error) {
    console.error("Error updating menu addon:", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขตัวเลือกเสริมได้" },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id]/addons/[addonId] - ลบ add-on
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  try {
    const { addonId } = await params;

    await db.menuAddon.delete({
      where: { id: addonId },
    });

    return NextResponse.json({ message: "ลบตัวเลือกเสริมสำเร็จ" });
  } catch (error) {
    console.error("Error deleting menu addon:", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบตัวเลือกเสริมได้" },
      { status: 500 }
    );
  }
}
