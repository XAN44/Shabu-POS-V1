"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../app/types/socket";

type SocketIOClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export const useSocket = () => {
  const [socket, setSocket] = useState<SocketIOClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");

  const connect = useCallback(() => {
    if (!socket) {
      const newSocket = io("http://localhost:3000", {
        // ✅ เปลี่ยนจาก 3001 เป็น 3000
        transports: ["websocket", "polling"],
        autoConnect: true,
        timeout: 5000,
        forceNew: true,
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server:", newSocket.id);
        setIsConnected(true);
        setConnectionStatus("Connected");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from Socket.IO server:", reason);
        setIsConnected(false);
        setConnectionStatus(`Disconnected: ${reason}`);
      });

      newSocket.on("hello", (message) => {
        console.log("👋 Received hello:", message);
        setConnectionStatus(`Connected - ${message}`);
      });

      newSocket.on("pong", (message) => {
        console.log("🏓 Received pong:", message);
      });

      // ✅ เพิ่ม order event listeners
      newSocket.on("newOrder", (data) => {
        console.log("🔔 New order event:", data);
      });

      newSocket.on("orderStatusChanged", (data) => {
        console.log("📝 Order status changed event:", data);
      });

      newSocket.on("orderStatusUpdated", (data) => {
        console.log("✅ Order status updated event:", data);
      });

      newSocket.on("tableStatusChanged", (data) => {
        console.log("🪑 Table status changed event:", data);
      });

      newSocket.on("connect_error", (error) => {
        console.error("🚫 Connection error:", error);
        setConnectionStatus(`Connection error: ${error.message}`);
      });

      setSocket(newSocket);
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus("Disconnected");
    }
  }, [socket]);

  const sendPing = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("ping");
      console.log("🏓 Ping sent to server");
    }
  }, [socket, isConnected]);

  // ✅ เพิ่มฟังก์ชันสำหรับ join/leave rooms
  const joinTable = useCallback(
    (tableId: string) => {
      if (socket && isConnected) {
        socket.emit("joinTable", tableId);
        console.log(`🪑 Joined table room: ${tableId}`);
      }
    },
    [socket, isConnected]
  );

  const leaveTable = useCallback(
    (tableId: string) => {
      if (socket && isConnected) {
        socket.emit("leaveTable", tableId);
        console.log(`🚪 Left table room: ${tableId}`);
      }
    },
    [socket, isConnected]
  );

  // ✅ เพิ่มฟังก์ชันสำหรับส่ง order status update
  const updateOrderStatus = useCallback(
    (data: { orderId: string; status: string; tableId: string }) => {
      if (socket && isConnected) {
        socket.emit("orderStatusUpdate", data);
        console.log("📝 Order status update sent:", data);
      }
    },
    [socket, isConnected]
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendPing,
    joinTable,
    leaveTable,
    updateOrderStatus,
  };
};
