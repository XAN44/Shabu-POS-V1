import db from "@/src/app/lib/prismaClient";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { number, seats, status, qrCode } = await req.json();

    const updatedTable = await db.table.update({
      where: { id },
      data: {
        number,
        seats,
        status,
        qrCode,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.table.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tables = await db.table.findMany();
  return NextResponse.json(tables);
}
