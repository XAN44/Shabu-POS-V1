// API
import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/prismaClient";
import { cloudinary } from "../../lib/cloudinary";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const menuItems = await db.menuItem.findMany();
  return NextResponse.json(menuItems);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const menuItem = await db.menuItem.create({
    data: {
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description,
      available: data.available,
      image: data.image,
      imageKey: data.imageKey,
    },
  });
  return NextResponse.json(menuItem);
}
