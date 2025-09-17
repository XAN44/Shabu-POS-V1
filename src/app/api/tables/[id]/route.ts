import db from "@/src/app/lib/prismaClient";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    const { status: newStatus } = await req.json();

    if (!newStatus) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // อัปเดต TABLE STATUS ไม่ใช่ ORDER STATUS
    const updatedTable = await db.table.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Failed to update table status:", error);
    return NextResponse.json(
      { error: "Failed to update table status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.table.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tables = await db.table.findMany();
  return NextResponse.json(tables);
}
