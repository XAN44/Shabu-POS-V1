// app/api/socketio/route.ts
import { NextResponse } from "next/server";
import { initializeSocket } from "../../lib/socket";

export async function GET() {
  try {
    const io = initializeSocket();

    return NextResponse.json({
      message: "Socket.IO server initialized",
      connected: io.engine.clientsCount,
      status: "running",
    });
  } catch (error) {
    console.error("Socket.IO initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Socket.IO" },
      { status: 500 }
    );
  }
}
