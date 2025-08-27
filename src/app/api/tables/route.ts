import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/prismaClient";
import qrcode from "qrcode-generator";
import type { UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { cloudinary } from "../../lib/cloudinary";

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

    // 1. สร้างโต๊ะใน DB ก่อน
    const newTable = await db.table.create({
      data: { number, seats, status },
    });

    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const tableURL = `${baseURL}/menu?table=${newTable.id}`;

    // 2. สร้าง QR Code เป็น DataURL
    const qr = qrcode(0, "L");
    qr.addData(tableURL);
    qr.make();
    const qrDataUrl = qr.createDataURL(4); // PNG DataURL

    // 3. แปลง DataURL → Buffer
    const base64Data = qrDataUrl.split(",")[1]; // ตัด prefix "data:image/png;base64,"
    const buffer = Buffer.from(base64Data, "base64");

    // 4. อัปโหลดไป Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "table-qrcodes",
            public_id: uuidv4(),
            resource_type: "image",
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              reject(error);
            } else if (!result) {
              reject(new Error("No result from Cloudinary"));
            } else {
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      }
    );

    console.log("✅ Cloudinary upload success:", uploadResult.secure_url);

    // 5. อัปเดท URL ลง DB
    const updatedTable = await db.table.update({
      where: { id: newTable.id },
      data: { qrCode: uploadResult.secure_url },
    });

    return NextResponse.json(updatedTable, { status: 201 });
  } catch (error) {
    console.error("❌ Error in /api/tables:", error);
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
