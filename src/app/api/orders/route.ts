import { NextResponse } from "next/server";
import db from "../../lib/prismaClient";
import {
  NewOrderEvent,
  OrderInput,
  OrderStatusEvent,
  TableStatusEvent,
} from "../../types/socket-event";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
      orderBy: { orderTime: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - สร้างออเดอร์ใหม่
export async function POST(req: Request) {
  try {
    const body: OrderInput = await req.json();

    if (!body.tableId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Table ID and items are required" },
        { status: 400 }
      );
    }

    const table = await db.table.findUnique({
      where: { id: body.tableId },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const itemsWithPrice = await Promise.all(
      body.items.map(async (item) => {
        const menu = await db.menuItem.findUnique({
          where: { id: item.menuItemId },
        });
        if (!menu) {
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }
        return {
          ...item,
          price: menu.price,
          menuName: menu.name,
        };
      })
    );

    const totalAmount = itemsWithPrice.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = await db.order.create({
      data: {
        tableId: body.tableId,
        status: "new",
        totalAmount,
        notes: body.notes,
        customerName: body.customerName,
        items: {
          create: itemsWithPrice.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.option
              ? `Option: ${item.option}${item.notes ? `, ${item.notes}` : ""}`
              : item.notes,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
    });

    // อัปเดตสถานะโต๊ะ
    await db.table.update({
      where: { id: body.tableId },
      data: { status: "occupied" },
    });

    // ✅ Enhanced Socket.IO events emission
    try {
      if (global.io) {
        console.log(`📡 Emitting new order events for order ${newOrder.id}`);

        const newOrderEvent: NewOrderEvent = {
          orderId: newOrder.id,
          tableId: body.tableId,
          tableName: `โต๊ะ ${table?.number ?? ""}`,
          totalAmount,
          itemsCount: body.items.reduce((sum, item) => sum + item.quantity, 0),
          customerName: body.customerName,
          timestamp: new Date(),
        };

        const orderStatusEvent: OrderStatusEvent = {
          orderId: newOrder.id,
          status: "new",
          tableId: body.tableId!,
          timestamp: new Date(),
        };

        const tableStatusEvent: TableStatusEvent = {
          tableId: body.tableId,
          status: "occupied",
          timestamp: new Date(),
        };

        // ✅ แจ้ง dashboard ทุกคนว่ามีออเดอร์ใหม่
        global.io.to("dashboard").emit("newOrder", newOrderEvent);

        // ✅ แจ้งโต๊ะที่สั่งว่าออเดอร์ถูกส่งแล้ว
        global.io
          .to(`table-${body.tableId}`)
          .emit("orderStatusUpdated", orderStatusEvent);

        // ✅ แจ้งการเปลี่ยนสถานะโต๊ะ
        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);

        // ✅ แจ้งโต๊ะว่ามีการอัปเดตออเดอร์
        global.io.to(`table-${body.tableId}`).emit("tableOrdersUpdate", {
          tableId: body.tableId,
          message: "New order created",
        });

        console.log(
          `✅ All socket events emitted successfully for order ${newOrder.id}`
        );
      } else {
        console.warn("⚠️ Socket.io not available");
      }
    } catch (err) {
      console.error("🚨 Socket.io emit failed:", err);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
