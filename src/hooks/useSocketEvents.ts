// hooks/useSocketEvents.ts
import { useEffect } from "react";
import { useSocketContext } from "../app/providers/SocketProvider";
import { SocketOrderData, SocketStatusData } from "../app/types/menu";

interface UseSocketEventsProps {
  tableId: string | null;
  fetchOrders: () => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useSocketEvents = ({
  tableId,
  fetchOrders,
  updateOrderStatus,
}: UseSocketEventsProps) => {
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!socket || !isConnected || !tableId) return;

    // Join table room และ dashboard room
    socket.emit("joinTable", tableId);
    socket.emit("joinTable", "dashboard");

    const handleNewOrder = (data: SocketOrderData) => {
      if (data.tableId === tableId) {
        fetchOrders();
      }
    };

    const handleOrderStatusChanged = (data: SocketStatusData) => {
      if (data.tableId === tableId) {
        console.log(`Order ${data.orderId} status changed to: ${data.status}`);
        updateOrderStatus(data.orderId, data.status);

        if (data.status === "served") {
          console.log(
            `Order ${data.orderId} is now served - should show bill button`
          );
        }
      }
    };

    const handleOrderStatusUpdated = (data: SocketStatusData) => {
      console.log(`Order ${data.orderId} status updated to: ${data.status}`);
      updateOrderStatus(data.orderId, data.status);

      if (data.status === "served") {
        console.log(
          `Order ${data.orderId} updated to served - should show bill button`
        );
      }
    };

    const handleTableOrdersUpdate = (data: {
      tableId: string;
      message: string;
    }) => {
      if (data.tableId === tableId) {
        console.log(`Table ${tableId} orders updated:`, data.message);
      }
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusChanged", handleOrderStatusChanged);
    socket.on("orderStatusUpdated", handleOrderStatusUpdated);
    socket.on("tableOrdersUpdate", handleTableOrdersUpdate);

    socket.emit("ping");

    return () => {
      socket.emit("leaveTable", tableId);
      socket.emit("leaveTable", "dashboard");
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusChanged", handleOrderStatusChanged);
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
      socket.off("tableOrdersUpdate", handleTableOrdersUpdate);
    };
  }, [socket, isConnected, tableId, fetchOrders, updateOrderStatus]);

  return { socket, isConnected };
};
