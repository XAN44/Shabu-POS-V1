import { NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ดึงข้อมูลบิลพร้อมกับข้อมูลโต๊ะ
    const bill = await db.bill.findUnique({
      where: {
        id: id,
      },
      include: {
        table: true, // ดึงข้อมูลโต๊ะมาด้วย
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // ดึงข้อมูล orders ที่เกี่ยวข้องกับบิลนี้
    const orders = await db.order.findMany({
      where: {
        id: {
          in: bill.orderIds,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
            addons: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
    });

    // รวมข้อมูลบิลและออเดอร์
    const billWithOrders = {
      ...bill,
      orders: orders,
    };

    return NextResponse.json(billWithOrders);
  } catch (error) {
    console.error("Failed to fetch bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}
