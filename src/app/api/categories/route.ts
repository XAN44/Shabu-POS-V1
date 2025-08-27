// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import db from "../../lib/prismaClient";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "ชื่อหมวดหมู่จำเป็น" }, { status: 400 });

  const newCategory = await db.category.create({ data: { name } });
  return NextResponse.json(newCategory);
}
