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

    // ถ้าสถานะเปลี่ยนเป็น "served" ให้เปลี่ยนสถานะโต๊ะเป็น "available"
    if (body.status === OrderStatus.served) {
      await db.table.update({
        where: { id: existingOrder.tableId },
        data: { status: "available" },
      });
    }

    // ✅ Emit Socket.IO events with proper typing
    try {
      if (global.io && body.status) {
        const orderStatusEvent: OrderStatusEvent = {
          orderId: id,
          status: body.status,
          timestamp: new Date(),
          tableId: existingOrder.tableId,
        };

        const tableStatusEvent: TableStatusEvent = {
          tableId: existingOrder.tableId,
          status:
            body.status === OrderStatus.served
              ? "available"
              : existingOrder.table.status,
          timestamp: new Date(),
        };

        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);

        // แจ้ง dashboard ทุกคน
        global.io.to("dashboard").emit("orderStatusChanged", orderStatusEvent);

        // แจ้งโต๊ะที่เกี่ยวข้อง
        global.io
          .to(`table-${existingOrder.tableId}`)
          .emit("orderStatusUpdated", orderStatusEvent);

        // ถ้าเสิร์ฟแล้ว แจ้งการเปลี่ยนสถานะโต๊ะด้วย
        if (body.status === OrderStatus.served) {
          global.io.to("dashboard").emit("tableStatusChanged", {
            tableId: existingOrder.tableId,
            status: "available",
            timestamp: new Date(),
          });
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
    await db.table.update({
      where: { id: existingOrder.tableId },
      data: { status: "available" },
    });

    // ✅ Emit Socket.IO events
    try {
      if (global.io) {
        const orderStatusEvent: OrderStatusEvent = {
          orderId: id,
          status: OrderStatus.cancelled,
          timestamp: new Date(),
          tableId: existingOrder.tableId,
        };

        const tableStatusEvent: TableStatusEvent = {
          tableId: existingOrder.tableId,
          status: "available",
          timestamp: new Date(),
        };

        // แจ้ง dashboard
        global.io.to("dashboard").emit("orderStatusChanged", orderStatusEvent);

        global.io
          .to(`table-${existingOrder.tableId}`)
          .emit("orderStatusUpdated", orderStatusEvent);

        // แจ้งการเปลี่ยนสถานะโต๊ะ
        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);

        console.log(
          `🗑️ Order ${id} deleted, emitted to dashboard & table ${existingOrder.tableId}`
        );
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
