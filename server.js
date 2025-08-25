import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const hostname = dev ? "localhost" : "0.0.0.0";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io;

if (global.io) {
  global.io.emit("menu:updated", menuItem);
}
app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // ✅ รองรับทั้ง websocket และ polling
  });

  // ✅ Enhanced Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // ✅ Send connection status
    socket.emit("connectionStatus", {
      connected: true,
      clientsCount: io.engine.clientsCount,
    });

    // ✅ Handle dashboard joining
    socket.on("joinDashboard", () => {
      console.log(`🖥️ Socket ${socket.id} joining dashboard room`);
      socket.join("dashboard");
      socket.data.role = "dashboard";
      socket.emit("hello", "Joined dashboard room");

      // ✅ ส่งข้อมูลปัจจุบันให้ dashboard
      socket.emit("dashboardConnected", {
        message: "Connected to dashboard",
        timestamp: new Date(),
      });
    });

    // ✅ Handle table joining for customers
    socket.on("joinTable", (tableId) => {
      console.log(
        `📋 Socket ${socket.id} joining table room: table-${tableId}`
      );
      socket.join(`table-${tableId}`);
      socket.data.tableId = tableId;
      socket.data.role = "customer";
      socket.emit("hello", `Joined table room: table-${tableId}`);

      // ✅ ส่งสถานะปัจจุบันให้ลูกค้า
      socket.emit("tableConnected", {
        tableId,
        message: "Connected to table room",
        timestamp: new Date(),
      });
    });

    // ✅ Handle room leaving
    socket.on("leaveTable", (tableId) => {
      console.log(
        `📤 Socket ${socket.id} leaving table room: table-${tableId}`
      );
      socket.leave(`table-${tableId}`);
      socket.data.tableId = null;
    });

    socket.on("leaveDashboard", () => {
      console.log(`📤 Socket ${socket.id} leaving dashboard room`);
      socket.leave("dashboard");
      socket.data.role = null;
    });

    // ✅ Handle ping/pong for connection testing
    socket.on("ping", () => {
      socket.emit("pong", { message: "pong", timestamp: new Date() });
    });

    socket.on("hello", () => {
      socket.emit("hello", "Hello from server!");
    });

    // ✅ Handle order status updates from clients (mainly for dashboard)
    socket.on("orderStatusUpdate", (data) => {
      console.log(`📝 Order status update received:`, data);

      const broadcastData = {
        orderId: data.orderId,
        status: data.status,
        tableId: data.tableId,
        timestamp: new Date(),
      };

      // ✅ Broadcast to dashboard room (ให้ dashboard อื่นๆ ได้เห็น)
      socket.to("dashboard").emit("orderStatusChanged", broadcastData);

      // ✅ Broadcast to the specific table room (สำคัญที่สุด!)
      if (data.tableId) {
        console.log(`📤 Broadcasting to table-${data.tableId}:`, {
          orderId: data.orderId,
          status: data.status,
          timestamp: new Date(),
        });

        socket.to(`table-${data.tableId}`).emit("orderStatusUpdated", {
          orderId: data.orderId,
          status: data.status,
          timestamp: new Date(),
        });

        // ✅ เพิ่ม fallback notification
        socket.to(`table-${data.tableId}`).emit("tableOrdersUpdate", {
          tableId: data.tableId,
          message: `Order ${data.orderId} status changed to ${data.status}`,
          timestamp: new Date(),
        });
      }
    });

    // ✅ Handle table status updates
    socket.on("tableStatusUpdate", (data) => {
      console.log(`🔄 Table status update received:`, data);

      const broadcastData = {
        tableId: data.tableId,
        status: data.status,
        timestamp: new Date(),
      };

      // Broadcast to dashboard room
      socket.to("dashboard").emit("tableStatusChanged", broadcastData);

      // ✅ Also notify the table itself
      socket
        .to(`table-${data.tableId}`)
        .emit("tableStatusChanged", broadcastData);
    });

    // ✅ Handle new order notifications
    socket.on("newOrderNotification", (data) => {
      console.log(`🆕 New order notification:`, data);

      const broadcastData = {
        orderId: data.orderId,
        tableId: data.tableId,
        tableName: data.tableName,
        totalAmount: data.totalAmount,
        itemsCount: data.itemsCount,
        customerName: data.customerName,
        timestamp: new Date(),
      };

      // Broadcast to dashboard room
      socket.to("dashboard").emit("newOrder", broadcastData);

      // ✅ Confirm to the table that sent the order
      if (data.tableId) {
        socket.to(`table-${data.tableId}`).emit("orderConfirmed", {
          orderId: data.orderId,
          message: "Order received successfully",
          timestamp: new Date(),
        });
      }
    });

    // ✅ Request current orders for a table (useful for reconnection)
    socket.on("requestTableOrders", async (tableId) => {
      console.log(`📋 Requesting orders for table: ${tableId}`);

      try {
        // ✅ ส่งกลับการยืนยันว่าได้รับคำขอแล้ว
        socket.emit("tableOrdersUpdate", {
          tableId,
          message: "Orders request acknowledged",
          timestamp: new Date(),
        });

        // ✅ แจ้งให้ client รีเฟรชข้อมูล
        setTimeout(() => {
          socket.emit("refreshOrders", {
            tableId,
            message: "Please refresh your orders",
            timestamp: new Date(),
          });
        }, 500);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to fetch table orders",
          tableId,
          timestamp: new Date(),
        });
      }
    });

    // ✅ Handle manual refresh requests
    socket.on("refreshTableOrders", (tableId) => {
      console.log(`🔄 Manual refresh requested for table: ${tableId}`);

      socket.emit("tableOrdersUpdate", {
        tableId,
        message: "Manual refresh triggered",
        timestamp: new Date(),
      });
    });

    // ✅ Handle connection health check
    socket.on("healthCheck", () => {
      socket.emit("healthResponse", {
        status: "ok",
        timestamp: new Date(),
        connectedRooms: Array.from(socket.rooms),
      });
    });

    // ✅ Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);

      // ✅ Notify rooms about disconnection
      if (socket.data.tableId) {
        socket.to(`table-${socket.data.tableId}`).emit("userDisconnected", {
          tableId: socket.data.tableId,
          timestamp: new Date(),
        });
      }

      if (socket.data.role === "dashboard") {
        socket.to("dashboard").emit("dashboardDisconnected", {
          timestamp: new Date(),
        });
      }

      // Update connection status for remaining clients
      socket.broadcast.emit("connectionStatus", {
        connected: true,
        clientsCount: Math.max(0, io.engine.clientsCount - 1),
      });
    });

    // ✅ Error handling
    socket.on("error", (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });

    // ✅ Connection error handling
    socket.on("connect_error", (error) => {
      console.error(`🚨 Connection error for ${socket.id}:`, error);
    });
  });

  // ✅ Store io globally for API routes
  global.io = io;

  // ✅ Add helper functions for API routes
  global.broadcastToTable = (tableId, eventName, data) => {
    console.log(`📡 Broadcasting ${eventName} to table-${tableId}:`, data);
    io.to(`table-${tableId}`).emit(eventName, {
      ...data,
      timestamp: new Date(),
    });
  };

  global.broadcastToDashboard = (eventName, data) => {
    console.log(`📡 Broadcasting ${eventName} to dashboard:`, data);
    io.to("dashboard").emit(eventName, {
      ...data,
      timestamp: new Date(),
    });
  };

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO server initialized`);
  });

  // ✅ Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");

    // ✅ Notify all clients about shutdown
    io.emit("serverShutdown", {
      message: "Server is shutting down",
      timestamp: new Date(),
    });

    httpServer.close(() => {
      console.log("✅ HTTP server closed");
    });
  });

  // ✅ Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  });
});

export { io };
