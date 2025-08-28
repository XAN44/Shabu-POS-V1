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
        { error: "Order ID is required" },
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

    // อัปเดต order
    const updatedOrder = await db.order.update({
      where: { id },
      data: { status: newStatus },
      include: { table: true }, // ดึง table มาด้วย
    });

    // ถ้า order ยังมี table เช็คและอัปเดต status ของ table ด้วย (optional)
    if (updatedOrder.tableId && updatedOrder.table) {
      const tableStatus: "available" | "occupied" | "reserved" | "cleaning" =
        newStatus === "served" ? "available" : "occupied";

      await db.table.update({
        where: { id: updatedOrder.tableId },
        data: { status: tableStatus },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
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
