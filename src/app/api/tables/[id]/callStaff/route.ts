// src/app/api/tables/[id]/callStaff/route.ts
import { NextResponse } from "next/server";
import { TableStatus } from "@prisma/client";

import db from "@/src/app/lib/prismaClient";
import { CallStaffForBillEvent } from "@/src/app/types/socket";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const resolvedParams = await params;
    const tableId = resolvedParams.id;

    // Check if there are any existing bills for orders from this table
    const existingBills = await db.bill.findMany({
      where: {
        tableId: tableId,
      },
      select: {
        orderIds: true,
      },
    });

    // Get all order IDs that have already been billed
    const billedOrderIds = new Set(
      existingBills.flatMap((bill) => bill.orderIds)
    );

    // Find all orders for this table that haven't been billed yet
    const ordersToBill = await db.order.findMany({
      where: {
        tableId: tableId,
        status: {
          not: "cancelled", // Only exclude cancelled orders
        },
        id: {
          notIn: Array.from(billedOrderIds), // Exclude already billed orders
        },
      },
      include: {
        items: true,
      },
    });

    if (ordersToBill.length === 0) {
      return NextResponse.json(
        {
          error: "ไม่มีออเดอร์ที่ต้องเช็คบิล",
          message:
            "All orders for this table have already been billed or there are no orders",
        },
        { status: 404 }
      );
    }

    // Calculate total amount from unbilled orders only
    const totalAmount = ordersToBill.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Get table information
    const table = await db.table.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        number: true,
        status: true,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // ส่งสัญญาณเรียกพนักงานผ่าน Socket แทนการเช็คเอาท์จริง
    if (typeof global !== "undefined" && global.io) {
      try {
        // ส่งสัญญาณเรียกพนักงานไป POS Dashboard
        const callStaffEvent: CallStaffForBillEvent = {
          type: "CALL_STAFF_FOR_BILL",
          tableId: tableId,
          tableNumber: table.number,
          tableName: `โต๊ะ ${table.number}`,
          totalAmount: totalAmount,
          orderCount: ordersToBill.length,
          orders: ordersToBill.map((order) => ({
            id: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            orderTime: order.orderTime,
            itemsCount: order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
          })),
          orderIds: ordersToBill.map((order) => order.id),
          timestamp: new Date().toISOString(),
          customerRequest: true,
          urgent: false,
        };

        // ส่งไปที่ POS Dashboard
        global.io.to("dashboard").emit("callStaffForBill", callStaffEvent);

        // ส่งยืนยันกลับไปให้ลูกค้าที่โต๊ะ
        global.io.to(`table-${tableId}`).emit("staffCalled", {
          tableId: tableId,
          message: "พนักงานจะมาเช็คบิลในไม่ช้า",
          timestamp: new Date().toISOString(),
        });

        console.log(
          `Staff called for table ${table.number} - Total: ฿${totalAmount}`
        );
      } catch (socketError) {
        console.warn("Socket.IO emission failed:", socketError);
      }
    }

    // ส่งข้อมูลสรุปกลับไปให้ลูกค้า (ไม่สร้างบิลจริง)
    return NextResponse.json({
      success: true,
      message: "เรียกพนักงานสำเร็จ พนักงานจะมาเช็คบิลในไม่ช้า",
      action: "STAFF_CALLED",
      table: {
        id: table.id,
        number: table.number,
        status: table.status,
      },
      billPreview: {
        totalAmount: totalAmount,
        orderCount: ordersToBill.length,
        orderIds: ordersToBill.map((order) => order.id),
      },
      note: "บิลจะถูกสร้างโดยพนักงานหลังจากรับชำระเงินแล้ว",
    });
  } catch (error) {
    console.error("Call staff failed:", error);

    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check for specific Prisma errors
    if (error === "P2025") {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to call staff",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
