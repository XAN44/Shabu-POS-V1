import { NextResponse } from "next/server";
import db from "../../lib/prismaClient";

export async function GET(req: Request) {
  const period = new URL(req.url).searchParams.get("period") || "thisWeek";

  const orders = await db.order.findMany({
    where: { status: "served" },
    include: { items: true },
  });

  const tables = await db.table.findMany();

  const days = period === "thisWeek" ? 7 : period === "thisMonth" ? 30 : 365;
  const revenuePerDay = Array(days).fill(0);
  const ordersPerDay = Array(days).fill(0);

  const now = new Date();

  orders.forEach((o) => {
    const diff = Math.floor(
      (now.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < days) {
      const index = days - diff - 1;
      revenuePerDay[index] += o.totalAmount;
      ordersPerDay[index] += 1;
    }
  });

  const utilization =
    tables.length > 0
      ? Math.round(
          (tables.filter((t) => t.status === "occupied").length /
            tables.length) *
            100
        )
      : 0;

  return NextResponse.json({
    revenuePerDay,
    ordersPerDay,
    tableUtilization: utilization,
  });
}
