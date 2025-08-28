import { NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIds = searchParams.get("orderIds");

    console.log("=== DEBUG ORDERS ===");
    console.log("OrderIds param:", orderIds);

    if (!orderIds) {
      return NextResponse.json({ error: "orderIds required" }, { status: 400 });
    }

    const idsArray = orderIds.split(",");
    console.log("Parsed orderIds:", idsArray);

    // ตรวจสอบว่า orders มีอยู่จริงไหม
    const orders = await db.order.findMany({
      where: {
        id: {
          in: idsArray,
        },
      },
      include: {
        table: { select: { number: true } },
        items: {
          include: {
            menuItem: {
              select: { name: true, price: true },
            },
          },
        },
      },
    });

    console.log("Orders found:", orders.length);
    console.log("Orders data:", JSON.stringify(orders, null, 2));

    return NextResponse.json({
      orderIds: idsArray,
      ordersFound: orders.length,
      orders: orders,
    });
  } catch (error) {
    console.error("Debug orders error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
