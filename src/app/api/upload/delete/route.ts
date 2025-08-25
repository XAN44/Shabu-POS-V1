import { cloudinary } from "@/src/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: "ไม่พบ Public ID" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: result.result === "ok",
      message: "ลบภาพสำเร็จ",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบภาพ" },
      { status: 500 }
    );
  }
}
