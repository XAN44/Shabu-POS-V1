import { NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ดึงบิล
    const bill = await db.bill.findUnique({
      where: { id },
      include: {
        table: { select: { number: true } },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // ดึง Orders ทั้งหมดที่อยู่ใน bill.orderIds พร้อม table info
    const orders = await db.order.findMany({
      where: { id: { in: bill.orderIds } },
      include: {
        table: { select: { number: true } }, // เพิ่มข้อมูลโต๊ะ
        items: {
          include: {
            menuItem: { select: { name: true, price: true } }, // เพิ่ม price
          },
        },
      },
      orderBy: { orderTime: "asc" }, // เรียงตามเวลา
    });

    // รวมข้อมูลให้ตรงกับ interface ที่ component คาดหวัง
    const responseData = {
      ...bill,
      orders, // ใส่ orders เข้าไปใน bill object
      table: bill.table || orders[0]?.table || null, // ใช้ table จาก bill หรือ order แรก
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}
