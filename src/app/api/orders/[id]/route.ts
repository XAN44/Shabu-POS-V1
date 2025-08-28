// API ORDER ID
import { NextResponse } from "next/server";
import db from "../../../lib/prismaClient";
import { OrderStatusEvent, TableStatusEvent } from "@/src/app/types/socket";
import { OrderStatus } from "@prisma/client";

// Define the UpdateOrderInput type
interface UpdateOrderInput {
  status?: OrderStatus;
  notes?: string;
}

// PATCH - อัปเดตสถานะออเดอร์
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateOrderInput = await req.json();

    if (!body.status && !body.notes) {
      return NextResponse.json(
        { error: "At least status or notes is required" },
        { status: 400 }
      );
    }

    // ดึงออเดอร์เดิมก่อน
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // อัปเดตออเดอร์
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
    });

    // ถ้ามี tableId และ status served ให้เปลี่ยนสถานะโต๊ะ
    if (body.status === OrderStatus.served && existingOrder.tableId) {
      await db.table.update({
        where: { id: existingOrder.tableId },
        data: { status: "available" },
      });
    }

    // Emit Socket.IO events
    try {
      if (global.io && body.status) {
        const tableIdSafe = existingOrder.tableId ?? "unknown";
        const tableStatusSafe = existingOrder.table?.status ?? "available";

        const orderStatusEvent: OrderStatusEvent = {
          orderId: id,
          status: body.status,
          timestamp: new Date(),
          tableId: tableIdSafe,
        };

        const tableStatusEvent: TableStatusEvent = {
          tableId: tableIdSafe,
          status:
            body.status === OrderStatus.served ? "available" : tableStatusSafe,
          timestamp: new Date(),
        };

        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);
        global.io.to("dashboard").emit("orderStatusChanged", orderStatusEvent);

        if (existingOrder.tableId) {
          global.io
            .to(`table-${existingOrder.tableId}`)
            .emit("orderStatusUpdated", orderStatusEvent);
        }
      }
    } catch (err) {
      console.warn("⚠️ Socket.io emit failed:", err);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH /api/orders/[id] failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update order",
      },
      { status: 500 }
    );
  }
}

// DELETE - ลบออเดอร์
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ลบออเดอร์
    await db.order.delete({ where: { id } });

    // เปลี่ยนสถานะโต๊ะกลับเป็น available
    if (existingOrder.tableId) {
      await db.table.update({
        where: { id: existingOrder.tableId },
        data: { status: "available" },
      });
    }

    // Emit Socket.IO events
    try {
      if (global.io) {
        const tableIdSafe = existingOrder.tableId ?? "unknown";

        const orderStatusEvent: OrderStatusEvent = {
          orderId: id,
          status: OrderStatus.cancelled,
          timestamp: new Date(),
          tableId: tableIdSafe,
        };

        const tableStatusEvent: TableStatusEvent = {
          tableId: tableIdSafe,
          status: "available",
          timestamp: new Date(),
        };

        global.io.to("dashboard").emit("orderStatusChanged", orderStatusEvent);

        if (existingOrder.tableId) {
          global.io
            .to(`table-${existingOrder.tableId}`)
            .emit("orderStatusUpdated", orderStatusEvent);
        }

        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);
      }
    } catch (err) {
      console.warn("⚠️ Socket.io emit failed:", err);
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/orders/[id] failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete order",
      },
      { status: 500 }
    );
  }
}

// GET - ดึง order ของโต๊ะ
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const table = await db.table.findUnique({
      where: { id },
      select: { lastClearedAt: true },
    });

    if (!table) {
      return NextResponse.json({ error: "ไม่พบโต๊ะนี้" }, { status: 404 });
    }

    const orders = await db.order.findMany({
      where: {
        tableId: id,
        createdAt: { gt: table.lastClearedAt },
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        orderTime: true,
        items: {
          select: {
            menuItem: true,
            quantity: true,
            notes: true,
          },
        },
      },
      orderBy: { orderTime: "asc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to get orders" },
      { status: 500 }
    );
  }
}
