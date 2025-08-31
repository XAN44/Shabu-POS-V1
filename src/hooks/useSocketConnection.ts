import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSocketContext } from "@/src/app/providers/SocketProvider";
import {
  NewOrderEvent,
  parseOrderStatus,
  parseTableStatus,
  statusMessages,
  CallStaffForBillEvent,
  StaffCalledEvent,
} from "@/src/app/types/socket";
import { Order, Table } from "@/src/app/types/Order";
import { API_ENDPOINTS } from "../app/(protected)/constants/api";
import { OrderStatus } from "@/src/app/types/Order";

// Define the TableCheckedOutEvent based on the actual socket data structure
interface TableCheckedOutEvent {
  tableId: string;
  totalAmount: number;
  orders: {
    id: string;
    tableId: string | null;
    tableNumber: string | null;
    totalAmount: number;
    status: OrderStatus;
    orderTime: Date;
    notes: string | null;
    customerName: string | null;
    createdAt: Date;
  }[];
  number: string;
  tableName: string;
  timestamp: string;
}

export interface UseSocketConnectionProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setBilledOrderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchData: (isBackground?: boolean) => Promise<void>;
  playSound: (
    type: "newOrder" | "checkout" | "staffCall",
    tableId?: string
  ) => Promise<void>;
  stopStaffCallSound: (tableId?: string) => void;
  onCallStaffForBill: (data: CallStaffForBillEvent) => void;
  onStaffCalled: (data: StaffCalledEvent) => void;
  onTableCheckedOut: (data: TableCheckedOutEvent) => void;
}

export const useSocketConnection = ({
  orders,
  setOrders,
  setTables,
  setBilledOrderIds,
  fetchData,
  playSound,
  stopStaffCallSound,
  onCallStaffForBill,
  onStaffCalled,
  onTableCheckedOut,
}: UseSocketConnectionProps) => {
  const { socket, isConnected } = useSocketContext();

  const handleNewOrder = useCallback(
    (data: NewOrderEvent) => {
      toast.success(`ออเดอร์ใหม่จากโต๊ะ ${data.tableName || data.tableId}`, {
        description: `${data.itemsCount} รายการ - ฿${data.totalAmount}`,
        duration: 5000,
      });
      playSound("newOrder");

      setTimeout(() => {
        fetchData(true);
      }, 100);
    },
    [fetchData, playSound]
  );

  const handleOrderStatusChanged = useCallback(
    (data: {
      orderId: string;
      status: string;
      tableId: string;
      timestamp: Date;
    }) => {
      const parsedStatus = parseOrderStatus(data.status);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: parsedStatus } : order
        )
      );

      const statusText = statusMessages[parsedStatus] || data.status;
      toast.info(`ออเดอร์ ${data.orderId.slice(-8)} - ${statusText}`);
    },
    [setOrders]
  );

  const handleTableStatusChanged = useCallback(
    (data: { tableId: string; status: string; timestamp: Date }) => {
      const parsedStatus = parseTableStatus(data.status);

      setTables((prev) =>
        prev.map((table) =>
          table.id === data.tableId ? { ...table, status: parsedStatus } : table
        )
      );
    },
    [setTables]
  );

  const handleBillCreated = useCallback(() => {
    toast.success("สร้างบิลสำเร็จ!");

    setTimeout(() => {
      fetch(API_ENDPOINTS.BILLS)
        .then((res) => res.json())
        .then((bills) => {
          const billedIds = new Set<string>(
            bills.flatMap((bill: { orderIds: string[] }) => bill.orderIds)
          );
          setBilledOrderIds(billedIds);
        })
        .catch(console.error);
    }, 100);
  }, [setBilledOrderIds]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("joinDashboard");

    // Clean up existing listeners
    socket.off("newOrder");
    socket.off("orderStatusChanged");
    socket.off("tableStatusChanged");
    socket.off("billCreated");
    socket.off("tableCheckedOut");
    socket.off("callStaffForBill");
    socket.off("staffCalled");

    // Set up new listeners
    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusChanged", handleOrderStatusChanged);
    socket.on("tableStatusChanged", handleTableStatusChanged);
    socket.on("billCreated", handleBillCreated);
    socket.on("tableCheckedOut", onTableCheckedOut);
    socket.on("callStaffForBill", onCallStaffForBill);
    socket.on("staffCalled", onStaffCalled);

    return () => {
      socket.emit("leaveDashboard");
      socket.off("newOrder");
      socket.off("orderStatusChanged");
      socket.off("tableStatusChanged");
      socket.off("billCreated");
      socket.off("tableCheckedOut");
      socket.off("callStaffForBill");
      socket.off("staffCalled");
    };
  }, [
    socket,
    isConnected,
    handleNewOrder,
    handleOrderStatusChanged,
    handleTableStatusChanged,
    handleBillCreated,
    onTableCheckedOut,
    onCallStaffForBill,
    onStaffCalled,
  ]);

  return { socket, isConnected };
};
