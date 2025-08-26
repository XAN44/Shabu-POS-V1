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
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join rooms
    socket.on("joinTable", (tableId) => {
      socket.join(`table-${tableId}`);
      socket.data.tableId = tableId;
      console.log(`🍽️ ${socket.id} joined table-${tableId}`);
    });

    socket.on("joinDashboard", () => {
      socket.join("dashboard");
      socket.data.role = "dashboard";
      console.log(`🖥️ ${socket.id} joined dashboard`);
    });

    // Leave rooms
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

    // Checkout table
    socket.on(
      "checkoutTable",
      ({ tableId, totalAmount, orders, number, tableName }) => {
        const tableNumber = number ?? "ไม่ระบุ";
        const finalTableName = tableName ?? `โต๊ะ ${tableNumber}`;

        console.log(`📤 Broadcasting tableCheckedOut for table ${tableNumber}`);

        io.to("dashboard").emit("tableCheckedOut", {
          tableId,
          totalAmount,
          orders,
          number: tableNumber,
          tableName: finalTableName,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // Order status updates
    socket.on("orderStatusUpdate", (data) => {
      const broadcastData = {
        orderId: data.orderId,
        status: data.status,
        tableId: data.tableId,
        timestamp: new Date(),
      };

      // Broadcast to dashboard room
      socket.to("dashboard").emit("orderStatusChanged", broadcastData);

      // Broadcast to the specific table room
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

        socket.to(`table-${data.tableId}`).emit("tableOrdersUpdate", {
          tableId: data.tableId,
          message: `Order ${data.orderId} status changed to ${data.status}`,
          timestamp: new Date(),
        });
      }
    });

    // Table status updates
    socket.on("tableStatusUpdate", (data) => {
      console.log(`🔄 Table status update received:`, data);

      const broadcastData = {
        tableId: data.tableId,
        status: data.status,
        timestamp: new Date(),
      };

      socket.to("dashboard").emit("tableStatusChanged", broadcastData);
      socket
        .to(`table-${data.tableId}`)
        .emit("tableStatusChanged", broadcastData);
    });

    // New order notifications
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

      socket.to("dashboard").emit("newOrder", broadcastData);

      if (data.tableId) {
        socket.to(`table-${data.tableId}`).emit("orderConfirmed", {
          orderId: data.orderId,
          message: "Order received successfully",
          timestamp: new Date(),
        });
      }
    });

    // ✅ FIXED: Call staff for bill - ลูกค้าเรียกพนักงาน
    socket.on("callStaffForBill", (data) => {
      console.log(`🔔 Call staff for bill received:`, data);

      const broadcastData = {
        type: "CALL_STAFF_FOR_BILL",
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        tableName: data.tableName,
        totalAmount: data.totalAmount,
        orderCount: data.orderCount,
        orders: data.orders,
        orderIds: data.orderIds,
        timestamp: new Date().toISOString(),
        customerRequest: data.customerRequest,
        urgent: data.urgent || false,
      };

      // ส่งไปยัง POS Dashboard
      socket.to("dashboard").emit("callStaffForBill", broadcastData);

      console.log(`📤 Broadcasting call staff for table ${data.tableNumber}`);
    });

    // ✅ FIXED: Staff response from dashboard - พนักงานตอบกลับจาก Dashboard
    socket.on("staffResponseFromDashboard", (data) => {
      console.log(`✅ Staff response from dashboard received:`, data);

      const confirmData = {
        tableId: data.tableId,
        message: data.message || "พนักงานจะมาเช็คบิลในไม่ช้า",
        timestamp: data.timestamp || new Date().toISOString(),
        staffConfirmed: true,
        status: "confirmed", // เพิ่ม status เพื่อให้ลูกค้าทราบ
      };

      // ✅ ส่งไปยังโต๊ะที่เรียกพนักงาน (ลูกค้า)
      socket.to(`table-${data.tableId}`).emit("staffCalled", confirmData);

      // ส่งไปยัง dashboard อื่นๆ เพื่อซิงค์สถานะ
      socket.to("dashboard").emit("staffResponseConfirmed", {
        tableId: data.tableId,
        timestamp: confirmData.timestamp,
      });

      console.log(
        `📤 Staff response confirmation sent to table-${data.tableId}`
      );
    });

    // ✅ REMOVED DUPLICATE: ลบ staffCalled event ที่ซ้ำ เหลือแค่ staffResponseFromDashboard

    // Table orders management
    socket.on("requestTableOrders", async (tableId) => {
      console.log(`📋 Requesting orders for table: ${tableId}`);

      try {
        socket.emit("tableOrdersUpdate", {
          tableId,
          message: "Orders request acknowledged",
          timestamp: new Date(),
        });

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

    socket.on("refreshTableOrders", (tableId) => {
      console.log(`🔄 Manual refresh requested for table: ${tableId}`);

      socket.emit("tableOrdersUpdate", {
        tableId,
        message: "Manual refresh triggered",
        timestamp: new Date(),
      });
    });

    // Health check and utilities
    socket.on("ping", () => {
      socket.emit("pong", { message: "pong", timestamp: new Date() });
    });

    socket.on("hello", () => {
      socket.emit("hello", "Hello from server!");
    });

    socket.on("healthCheck", () => {
      socket.emit("healthResponse", {
        status: "ok",
        timestamp: new Date(),
        connectedRooms: Array.from(socket.rooms),
      });
    });

    // Disconnection handling
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);

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

      socket.broadcast.emit("connectionStatus", {
        connected: true,
        clientsCount: Math.max(0, io.engine.clientsCount - 1),
      });
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });

    socket.on("connect_error", (error) => {
      console.error(`🚨 Connection error for ${socket.id}:`, error);
    });
  });

  // Store io globally for API routes
  global.io = io;

  // Helper functions for API routes
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

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");

    io.emit("serverShutdown", {
      message: "Server is shutting down",
      timestamp: new Date(),
    });

    httpServer.close(() => {
      console.log("✅ HTTP server closed");
    });
  });

  process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  });
});

export { io };
