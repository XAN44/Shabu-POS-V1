import { NextRequest, NextResponse } from "next/server";
import db from "@/src/app/lib/prismaClient";

// GET /api/menu/[id]/addons - ดึงรายการ add-ons ของเมนู
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const addons = await db.menuAddon.findMany({
      where: { menuItemId: id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(addons);
  } catch (error) {
    console.error("Error fetching menu addons:", error);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดตัวเลือกเสริมได้" },
      { status: 500 }
    );
  }
}

// POST /api/menu/[id]/addons - เพิ่ม add-on ใหม่
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    // ตรวจสอบว่าเมนูมีอยู่จริง
    const menuItem = await db.menuItem.findUnique({ where: { id } });
    if (!menuItem) {
      return NextResponse.json({ error: "ไม่พบเมนูที่ระบุ" }, { status: 404 });
    }

    const addon = await db.menuAddon.create({
      data: {
        menuItemId: id,
        name: data.name,
        price: data.price,
        category: data.category || null,
        description: data.description || null,
        available: data.available ?? true,
      },
    });

    return NextResponse.json(addon);
  } catch (error) {
    console.error("Error creating menu addon:", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มตัวเลือกเสริมได้" },
      { status: 500 }
    );
  }
}
