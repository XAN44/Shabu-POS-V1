// src/app/api/bills/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from "@/src/app/lib/prismaClient";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const tableId = url.searchParams.get("tableId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // สร้าง where clause with proper typing
    const where: Prisma.BillWhereInput = {};

    if (tableId) {
      where.tableId = tableId;
    }

    if (startDate || endDate) {
      where.paymentTime = {};
      if (startDate) {
        where.paymentTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentTime.lte = new Date(endDate);
      }
    }

    const bills = await db.bill.findMany({
      where,
      include: {
        table: {
          select: {
            number: true,
          },
        },
      },
      orderBy: {
        paymentTime: "desc",
      },
      take: limit,
      skip: offset,
    });

    // นับจำนวนทั้งหมด

    // ส่งกลับแค่ array ของ bills สำหรับความเรียบง่าย
    return NextResponse.json(bills);
  } catch (error) {
    console.error("Failed to fetch bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

// สำหรับสร้างบิลใหม่ (manual)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { tableId, orderIds, paymentMethod } = data;

    // ตรวจสอบว่า tableId และ orderIds มีอยู่จริง
    const table = await db.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const orders = await db.order.findMany({
      where: {
        id: { in: orderIds },
        tableId: tableId,
      },
    });

    if (orders.length !== orderIds.length) {
      return NextResponse.json(
        { error: "Some orders not found or don't belong to this table" },
        { status: 400 }
      );
    }

    // คำนวณยอดรวม
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // สร้างบิล
    const bill = await db.bill.create({
      data: {
        tableId,
        totalAmount,
        orderIds,
        paymentMethod,
      },
      include: {
        table: {
          select: {
            number: true,
          },
        },
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error("Failed to create bill:", error);
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
