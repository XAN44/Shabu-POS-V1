// src/app/api/tables/[id]/checkout/route.ts
import { NextResponse } from "next/server";
import { TableStatus } from "@prisma/client";

import db from "@/src/app/lib/prismaClient";
import { BillCreatedEvent, TableStatusEvent } from "@/src/app/types/socket";

interface CheckoutRequestBody {
  paymentMethod: "cash" | "qrcode";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tableId = resolvedParams.id;

    let paymentMethod: "cash" | "qrcode" = "cash";
    try {
      const body: CheckoutRequestBody = await req.json();
      paymentMethod = body.paymentMethod || "cash";
    } catch (error) {
      console.log("No payment method specified, defaulting to cash");
    }

    if (!["cash", "qrcode"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: "Invalid payment method",
          message: "Payment method must be either 'cash' or 'qrcode'",
        },
        { status: 400 }
      );
    }

    // ดึงข้อมูลโต๊ะเพื่อเช็ค lastClearedAt
    const table = await db.table.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        number: true,
        lastClearedAt: true,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // ดึงออเดอร์ที่สร้างหลังจาก lastClearedAt เท่านั้น (ลูกค้าคนปัจจุบัน)
    const currentCustomerOrders = await db.order.findMany({
      where: {
        tableId: tableId,
        status: {
          not: "cancelled",
        },
        // เงื่อนไขสำคัญ: ดึงเฉพาะออเดอร์ที่สร้างหลังจากเคลียร์โต๊ะครั้งล่าสุด
        orderTime: {
          gt: table.lastClearedAt,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        orderTime: "asc",
      },
    });

    if (currentCustomerOrders.length === 0) {
      return NextResponse.json(
        {
          error: "ไม่มีออเดอร์ใหม่ที่ต้องเช็คบิล",
          message: "No new orders found for this table since last clear",
        },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามี Bill ที่ยังไม่เสร็จสิ้นสำหรับลูกค้าคนปัจจุบันหรือไม่
    const existingActiveBill = await db.bill.findFirst({
      where: {
        tableId: tableId,
        // ตรวจสอบเฉพาะบิลที่สร้างหลังจาก lastClearedAt
        createdAt: {
          gt: table.lastClearedAt,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // คำนวณยอดรวมของออเดอร์ลูกค้าคนปัจจุบันเท่านั้น
    const totalAmount = currentCustomerOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const result = await db.$transaction(async (tx) => {
      let finalBill;

      if (existingActiveBill) {
        // อัปเดต Bill ที่มีอยู่แล้วสำหรับลูกค้าคนปัจจุบัน
        finalBill = await tx.bill.update({
          where: { id: existingActiveBill.id },
          data: {
            totalAmount: totalAmount,
            orderIds: currentCustomerOrders.map((order) => order.id),
            paymentMethod: paymentMethod,
            paymentTime: new Date(),
          },
        });
      } else {
        // สร้าง Bill ใหม่สำหรับลูกค้าคนปัจจุบัน
        finalBill = await tx.bill.create({
          data: {
            tableId: tableId,
            totalAmount: totalAmount,
            orderIds: currentCustomerOrders.map((order) => order.id),
            paymentMethod: paymentMethod,
          },
        });
      }

      // อัปเดตสถานะออเดอร์ของลูกค้าคนปัจจุบันเป็น 'served'
      await tx.order.updateMany({
        where: {
          id: {
            in: currentCustomerOrders.map((order) => order.id),
          },
        },
        data: {
          status: "served",
        },
      });

      // อัปเดตสถานะโต๊ะเป็น available และอัปเดต lastClearedAt
      // lastClearedAt จะถูกอัปเดตเป็นเวลาปัจจุบันเพื่อเป็นจุดอ้างอิงสำหรับลูกค้าคนถัดไป
      const updatedTable = await tx.table.update({
        where: { id: tableId },
        data: {
          status: TableStatus.available,
          lastClearedAt: new Date(), // สำคัญ: อัปเดตเวลาเคลียร์โต๊ะ
        },
        select: {
          id: true,
          number: true,
          status: true,
        },
      });

      return { bill: finalBill, table: updatedTable };
    });

    // Socket.IO events
    if (typeof global !== "undefined" && global.io) {
      try {
        const tableStatusEvent: TableStatusEvent = {
          tableId: tableId,
          status: "available",
          timestamp: new Date(),
        };

        global.io.to("dashboard").emit("tableStatusChanged", tableStatusEvent);

        global.io.to("dashboard").emit("tableCheckedOut", {
          tableId,
          totalAmount: result.bill.totalAmount,
          orders: currentCustomerOrders,
          number: String(result.table?.number ?? ""),
          tableName: `โต๊ะ ${result.table?.number ?? ""}`,
          timestamp: new Date().toISOString(),
        });

        const billEvent: BillCreatedEvent = {
          billId: result.bill.id,
          totalAmount: result.bill.totalAmount,
        };

        global.io.to(`table-${tableId}`).emit("billCreated", billEvent);
      } catch (socketError) {
        console.warn("Socket.IO emission failed:", socketError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Checkout completed successfully",
      bill: {
        id: result.bill.id,
        totalAmount: result.bill.totalAmount,
        tableId: result.bill.tableId,
        paymentTime: result.bill.paymentTime,
        paymentMethod: result.bill.paymentMethod,
        orderIds: result.bill.orderIds,
      },
      table: result.table,
      ordersBilled: currentCustomerOrders.length,
      paymentMethod: paymentMethod,
      // เพิ่มข้อมูลเพื่อ debug
      debug: {
        tableClearedAt: table.lastClearedAt,
        ordersAfterClear: currentCustomerOrders.length,
        orderTimeRange:
          currentCustomerOrders.length > 0
            ? {
                from: currentCustomerOrders[0].orderTime,
                to: currentCustomerOrders[currentCustomerOrders.length - 1]
                  .orderTime,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("Checkout failed:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    if (error === "P2025") {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to process checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // เมื่อเคลียร์โต๊ะ จะอัปเดต lastClearedAt เป็นเวลาปัจจุบัน
    // ทำให้ออเดอร์ใหม่ที่สร้างหลังจากนี้จะไม่ถูกรวมกับออเดอร์เก่า
    await db.table.update({
      where: { id },
      data: { lastClearedAt: new Date() },
    });
    return NextResponse.json({ message: "เคลียร์โต๊ะเรียบร้อย" });
  } catch (error) {
    console.error("POST /api/tables/[id]/clear failed:", error);
    return NextResponse.json(
      { error: "Failed to clear table" },
      { status: 500 }
    );
  }
}
