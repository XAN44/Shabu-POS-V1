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
      const dayOfWeek = now.getDay();
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

  const items = await db.orderItem.findMany({
    where: { order: { orderTime: { gte: startDate } } },
    include: { menuItem: true },
  });

  const dataMap: Record<string, number> = {};
  items.forEach((item) => {
    const name = item.menuItem.name;
    if (!dataMap[name]) dataMap[name] = 0;
    dataMap[name] += item.quantity;
  });

  const data = Object.keys(dataMap).map((name, idx) => ({
    name,
    quantity: dataMap[name],
    color: `hsl(${(idx * 50) % 360}, 70%, 50%, 0.8)`,
  }));

  return NextResponse.json(data);
}
