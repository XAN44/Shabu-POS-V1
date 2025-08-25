// lib/socket.ts
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";

// Global variable to store socket server
declare global {
  var io:
    | SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >
    | undefined;
}

export const initializeSocket = () => {
  if (!global.io) {
    console.log("Initializing Socket.IO server...");

    // Create HTTP server
    const httpServer = createServer();

    const io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.NEXTAUTH_URL
            : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Basic connection handler
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Send hello message to client
      socket.emit("hello", "Hello from server!");

      // Send connection status
      socket.emit("connectionStatus", {
        connected: true,
        clientsCount: io.engine.clientsCount,
      });

      // Handle ping from client
      socket.on("ping", () => {
        console.log("Ping received from client:", socket.id);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Start the server
    const port = parseInt(process.env.SOCKET_PORT || "3001");
    httpServer.listen(port, () => {
      console.log(`Socket.IO server running on port ${port}`);
    });

    global.io = io;
  }

  return global.io;
};
