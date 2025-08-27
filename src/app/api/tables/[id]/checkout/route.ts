// src/app/api/tables/[id]/checkout/route.ts
import { NextResponse } from "next/server";
import { TableStatus } from "@prisma/client";

import db from "@/src/app/lib/prismaClient";
import { BillCreatedEvent, TableStatusEvent } from "@/src/app/types/socket";

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

    // Start transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create the bill
      const newBill = await tx.bill.create({
        data: {
          tableId: tableId,
          totalAmount: totalAmount,
          orderIds: ordersToBill.map((order) => order.id),
          paymentMethod: "cash", // Default payment method
        },
      });

      // Update all orders to 'served' status
      await tx.order.updateMany({
        where: {
          id: {
            in: ordersToBill.map((order) => order.id),
          },
        },
        data: {
          status: "served",
        },
      });

      // Check if there are any remaining unbilled orders for this table
      const remainingOrders = await tx.order.findMany({
        where: {
          tableId: tableId,
          status: {
            not: "cancelled",
          },
          id: {
            notIn: [
              ...Array.from(billedOrderIds),
              ...ordersToBill.map((o) => o.id),
            ],
          },
        },
      });

      let updatedTable = null;
      if (remainingOrders.length === 0) {
        updatedTable = await tx.table.update({
          where: { id: tableId },
          data: { status: TableStatus.available, lastClearedAt: new Date() },
          select: {
            id: true,
            number: true,
            status: true,
          },
        });
        console.log("Table status updated to available");
      } else {
        // Get current table info without updating status
        updatedTable = await tx.table.findUnique({
          where: { id: tableId },
          select: {
            id: true,
            number: true,
            status: true,
          },
        });
      }

      return { bill: newBill, table: updatedTable };
    });

    if (typeof global !== "undefined" && global.io) {
      try {
        if (result.table?.status === TableStatus.available) {
          const tableStatusEvent: TableStatusEvent = {
            tableId: tableId,
            status: "available",
            timestamp: new Date(),
          };

          global.io
            .to("dashboard")
            .emit("tableStatusChanged", tableStatusEvent);
        }

        global.io.to("dashboard").emit("tableCheckedOut", {
          tableId,
          totalAmount: result.bill.totalAmount,
          orders: ordersToBill, // ให้ครบตาม type
          number: String(result.table?.number ?? ""),
          tableName: `โต๊ะ ${result.table?.number ?? ""}`,
          timestamp: new Date().toISOString(),
        });

        // Bill created event
        const billCreatedEvent: BillCreatedEvent = {
          billId: result.bill.id,
          totalAmount: result.bill.totalAmount,
        };

        global.io.to(`table-${tableId}`).emit("billCreated", billCreatedEvent);
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
      },
      table: result.table,
      ordersBilled: ordersToBill.length,
    });
  } catch (error) {
    console.error("Checkout failed:", error);

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
