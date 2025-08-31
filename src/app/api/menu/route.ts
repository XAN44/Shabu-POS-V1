// API menu
import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/prismaClient";

export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      include: {
        addons: true, // ดึง addons ของแต่ละเมนูด้วย
      },
      orderBy: {
        name: "asc", // ถ้าต้องการเรียงชื่อเมนู
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("GET /api/menu failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
