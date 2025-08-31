// app/api/qr-code/route.ts
import { NextResponse } from "next/server";
import db from "../../lib/prismaClient";

// Model สำหรับเก็บ QR Code setting
export async function POST(req: Request) {
  try {
    const { qrCodeUrl } = await req.json();

    if (!qrCodeUrl) {
      return NextResponse.json(
        { error: "QR Code URL is required" },
        { status: 400 }
      );
    }

    // ลบ QR Code เก่าทั้งหมด (ถ้ามี) และสร้างใหม่
    await db.qRCodeSetting.deleteMany({});

    const qrCodeSetting = await db.qRCodeSetting.create({
      data: {
        url: qrCodeUrl,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: qrCodeSetting,
    });
  } catch (error) {
    console.error("Error saving QR code:", error);
    return NextResponse.json(
      { error: "Failed to save QR code" },
      { status: 500 }
    );
  }
}

// GET: ดึง QR Code ปัจจุบัน
export async function GET() {
  try {
    const qrCodeSetting = await db.qRCodeSetting.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: qrCodeSetting,
    });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR code" },
      { status: 500 }
    );
  }
}

// PUT: อัพเดต QR Code
export async function PUT(req: Request) {
  try {
    const { qrCodeUrl } = await req.json();

    if (!qrCodeUrl) {
      return NextResponse.json(
        { error: "QR Code URL is required" },
        { status: 400 }
      );
    }

    // ปิดการใช้งาน QR Code เก่าทั้งหมด
    await db.qRCodeSetting.updateMany({
      data: {
        isActive: false,
      },
    });

    // สร้าง QR Code ใหม่
    const qrCodeSetting = await db.qRCodeSetting.create({
      data: {
        url: qrCodeUrl,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: qrCodeSetting,
    });
  } catch (error) {
    console.error("Error updating QR code:", error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}

// DELETE: ลบ QR Code
export async function DELETE() {
  try {
    await db.qRCodeSetting.updateMany({
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "QR Code disabled successfully",
    });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
