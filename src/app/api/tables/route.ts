import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/prismaClient";
import qrcode from "qrcode-generator";

// GET /api/tables
export async function GET() {
  try {
    const tables = await db.table.findMany();
    return NextResponse.json(tables);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ไม่สามารถดึงโต๊ะได้" }, { status: 500 });
  }
}

// POST /api/tables
export async function POST(req: NextRequest) {
  try {
    const { number, seats, status = "available" } = await req.json();

    if (typeof number !== "number" || typeof seats !== "number") {
      return NextResponse.json(
        { error: "number และ seats ต้องเป็นตัวเลข" },
        { status: 400 }
      );
    }

    // สร้างโต๊ะใน DB
    const newTable = await db.table.create({
      data: { number, seats, status },
    });

    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const tableURL = `${baseURL}/menu?table=${newTable.id}`;

    // สร้าง QR Code เป็น Data URL ด้วย qrcode-generator
    const qr = qrcode(0, "L"); // 0 = auto type, L = error correction
    qr.addData(tableURL);
    qr.make();
    const qrCodeDataURL = qr.createDataURL(4); // 4 = module size

    // อัพเดท QR Code ลง DB
    const updatedTable = await db.table.update({
      where: { id: newTable.id },
      data: { qrCode: qrCodeDataURL },
    });

    return NextResponse.json(updatedTable, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างโต๊ะได้" },
      { status: 500 }
    );
  }
}

// PATCH /api/tables/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updatedTable = await db.table.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขโต๊ะได้" },
      { status: 500 }
    );
  }
}

// DELETE /api/tables/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.table.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบโต๊ะเรียบร้อยแล้ว" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ไม่สามารถลบโต๊ะได้" }, { status: 500 });
  }
}
