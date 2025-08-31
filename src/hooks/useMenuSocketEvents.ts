import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { BillCreatedEvent, StaffCalledEvent } from "../app/types/socket";

interface UseMenuSocketEventsProps {
  socket: Socket | null;
  isConnected: boolean;
  tableId: string | null;
  tableName: string;
  fetchOrders: () => void;
  clearDraftCart: () => Promise<void>;
  setIsCheckingOut: (value: boolean) => void;
  setStaffCallPending: (value: boolean) => void;
}

export function useMenuSocketEvents({
  socket,
  isConnected,
  tableId,
  tableName,
  fetchOrders,
  clearDraftCart,
  setIsCheckingOut,
  setStaffCallPending,
}: UseMenuSocketEventsProps) {
  useEffect(() => {
    if (!socket || !isConnected || !tableId) {
      return;
    }

    socket.emit("joinTable", tableId);

    const handleStaffCalled = (data: StaffCalledEvent) => {
      if (data.tableId === tableId) {
        setIsCheckingOut(false);
        setStaffCallPending(false);

        toast.success("พนักงานตอบรับแล้ว! ✅", {
          description: data.message || "พนักงานกำลังมาที่โต๊ะ",
          duration: 5000,
          className: "border-green-200 bg-green-50",
        });
      }
    };

    const handleCheckBill = (data: BillCreatedEvent) => {
      if (data && tableId) {
        toast.success("เช็คบิลเรียบร้อย ✅", {
          description: `ยอดรวม ${data.totalAmount.toLocaleString()} บาท`,
          duration: 5000,
          className: "border-green-200 bg-green-50",
        });

        // 🔄 ดึงข้อมูลใหม่ (refresh orders)
        fetchOrders();

        // หรือถ้าต้องการเคลียร์ตะกร้า/รีเซ็ต state
        clearDraftCart();
      }
    };

    socket.on("staffCalled", handleStaffCalled);
    socket.on("billCreated", handleCheckBill);

    return () => {
      socket.emit("leaveTable", tableId);
      socket.off("billCreated");
      socket.off("staffCalled");
      if (window.staffCallTimeout) {
        clearTimeout(window.staffCallTimeout);
        window.staffCallTimeout = undefined;
      }
    };
  }, [
    socket,
    isConnected,
    tableId,
    tableName,
    fetchOrders,
    clearDraftCart,
    setIsCheckingOut,
    setStaffCallPending,
  ]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (window.staffCallTimeout) {
        clearTimeout(window.staffCallTimeout);
        window.staffCallTimeout = undefined;
      }
    };
  }, []);
}
