// app/api/draft-cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/prismaClient";

// GET - ดึง draft cart ของโต๊ะ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");

    console.log("📦 API Draft Cart GET: tableId =", tableId);

    if (!tableId) {
      console.log("📦 API Draft Cart GET: No tableId provided");
      return NextResponse.json(
        { error: "tableId is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าโต๊ะมีอยู่จริง
    const table = await db.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      console.log("📦 API Draft Cart GET: Table not found");
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const draftCart = await db.draftCart.findUnique({
      where: { tableId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
          orderBy: {
            id: "asc", // เรียงลำดับให้คงที่
          },
        },
      },
    });

    console.log(
      "📦 API Draft Cart GET: Found cart =",
      !!draftCart,
      "with items =",
      draftCart?.items?.length || 0
    );

    if (!draftCart) {
      return NextResponse.json(null, { status: 404 });
    }

    // ตรวจสอบว่า menuItems ยังมีอยู่และ available
    const validItems = draftCart.items.filter(
      (item) => item.menuItem && item.menuItem.available
    );

    if (validItems.length !== draftCart.items.length) {
      console.log(
        "📦 API Draft Cart GET: Some items are no longer available, updating cart"
      );

      // อัปเดต cart โดยเอาเฉพาะ items ที่ยังมีอยู่
      if (validItems.length === 0) {
        // ถ้าไม่มี items ที่ valid เลย ก็ลบ cart
        await db.draftCart.delete({
          where: { id: draftCart.id },
        });
        return NextResponse.json(null, { status: 404 });
      } else {
        // ลบ items ที่ไม่ valid และคืนค่า cart ที่อัปเดตแล้ว
        await db.draftCartItem.deleteMany({
          where: {
            draftCartId: draftCart.id,
            id: { notIn: validItems.map((item) => item.id) },
          },
        });

        // ดึงข้อมูล cart ใหม่
        const updatedCart = await db.draftCart.findUnique({
          where: { id: draftCart.id },
          include: {
            items: {
              include: {
                menuItem: true,
              },
              orderBy: {
                id: "asc",
              },
            },
          },
        });

        return NextResponse.json(updatedCart);
      }
    }

    return NextResponse.json(draftCart);
  } catch (error) {
    console.error("📦 API Draft Cart GET: Error fetching draft cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft cart" },
      { status: 500 }
    );
  }
}

// POST - บันทึก/อัปเดต draft cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, items } = body;

    console.log(
      "📦 API Draft Cart POST: tableId =",
      tableId,
      "items =",
      items?.length || 0
    );

    if (!tableId) {
      return NextResponse.json(
        { error: "tableId is required" },
        { status: 400 }
      );
    }

    // Validate tableId exists
    const table = await db.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      console.log("📦 API Draft Cart POST: Table not found");
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // ใช้ transaction เพื่อความปลอดภัย
    const result = await db.$transaction(async (tx) => {
      // ลบ draft cart เก่า (ถ้ามี)
      await tx.draftCart.deleteMany({
        where: { tableId },
      });

      console.log("📦 API Draft Cart POST: Deleted old cart");

      // ถ้าไม่มี items หรือ items ว่าง ก็ไม่ต้องสร้างใหม่
      if (!items || items.length === 0) {
        console.log("📦 API Draft Cart POST: No items to save");
        return null;
      }

      // Validate และกรอง menu items ที่มีอยู่และ available
      const menuItemIds = items.map(
        (item: { menuItemId: string }) => item.menuItemId
      );

      const validMenuItems = await tx.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          available: true,
        },
      });

      console.log(
        "📦 API Draft Cart POST: Valid menu items =",
        validMenuItems.length,
        "out of",
        menuItemIds.length
      );

      // กรอง items เอาเฉพาะที่ valid
      const validItems = items.filter(
        (item: { menuItemId: string; quantity: number }) =>
          validMenuItems.some((menuItem) => menuItem.id === item.menuItemId) &&
          item.quantity > 0
      );

      if (validItems.length === 0) {
        console.log("📦 API Draft Cart POST: No valid items to save");
        return null;
      }

      // สร้าง draft cart ใหม่
      const draftCart = await tx.draftCart.create({
        data: {
          tableId,
          items: {
            create: validItems.map(
              (item: { menuItemId: string; quantity: number }) => ({
                menuItemId: item.menuItemId,
                quantity: Math.max(1, Math.floor(item.quantity)), // Ensure minimum quantity is 1 and integer
              })
            ),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });

      console.log(
        "📦 API Draft Cart POST: Created new cart with",
        draftCart.items.length,
        "items"
      );
      return draftCart;
    });

    if (result === null) {
      return NextResponse.json(
        { message: "Draft cart cleared" },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("📦 API Draft Cart POST: Error saving draft cart:", error);
    return NextResponse.json(
      {
        error: "Failed to save draft cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - ลบ draft cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");

    console.log("📦 API Draft Cart DELETE: tableId =", tableId);

    if (!tableId) {
      return NextResponse.json(
        { error: "tableId is required" },
        { status: 400 }
      );
    }

    const deleteResult = await db.draftCart.deleteMany({
      where: { tableId },
    });

    console.log(
      "📦 API Draft Cart DELETE: Deleted",
      deleteResult.count,
      "carts"
    );

    return NextResponse.json({
      message: "Draft cart deleted",
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error(
      "📦 API Draft Cart DELETE: Error deleting draft cart:",
      error
    );
    return NextResponse.json(
      { error: "Failed to delete draft cart" },
      { status: 500 }
    );
  }
}
