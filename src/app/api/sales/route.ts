import { NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

export async function GET(req: Request) {
  const period = new URL(req.url).searchParams.get("period") || "today";

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "thisWeek":
      const dayOfWeek = now.getDay(); // 0=Sunday
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const orders = await db.order.findMany({
    where: { orderTime: { gte: startDate } },
    select: { totalAmount: true, orderTime: true },
  });

  // แบ่งตาม period สำหรับ chart
  const dataMap: Record<string, number> = {};

  orders.forEach((order) => {
    let key: string;
    const d = new Date(order.orderTime);

    switch (period) {
      case "today":
        key = `${d.getHours()}:00`;
        break;
      case "thisWeek":
        key = d.toLocaleDateString("th-TH", { weekday: "short" });
        break;
      case "thisMonth":
        key = d.getDate().toString();
        break;
      case "thisYear":
        key = (d.getMonth() + 1).toString();
        break;
      default:
        key = d.getDate().toString();
    }

    if (!dataMap[key]) dataMap[key] = 0;
    dataMap[key] += order.totalAmount;
  });

  const labels = Object.keys(dataMap).sort((a, b) => {
    if (period === "today") return parseInt(a) - parseInt(b);
    return a.localeCompare(b, "th-TH", { numeric: true });
  });
  const values = labels.map((l) => dataMap[l]);

  return NextResponse.json({ labels, values });
}
