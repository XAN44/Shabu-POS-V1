// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import db from "../../lib/prismaClient";

export async function GET() {
  try {
    const [orders, tables] = await Promise.all([
      db.order.findMany(),
      db.table.findMany(),
    ]);

    const stats = {
      totalOrders: orders.length,
      newOrders: orders.filter((o) => o.status === "new").length,
      preparingOrders: orders.filter((o) => o.status === "preparing").length,
      readyOrders: orders.filter((o) => o.status === "ready").length,
      totalRevenue: orders
        .filter((o) => o.status === "served")
        .reduce((sum, order) => sum + order.totalAmount, 0),
      availableTables: tables.filter((t) => t.status === "available").length,
      occupiedTables: tables.filter((t) => t.status === "occupied").length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
