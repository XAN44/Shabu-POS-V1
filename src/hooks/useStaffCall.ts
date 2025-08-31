import { useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { BillSummary } from "../app/types/menu";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../app/types/socket";

// Extend window for timeout management
declare global {
  interface Window {
    staffCallTimeout?: NodeJS.Timeout;
  }
}

interface UseStaffCallProps {
  socket: Socket | null;
  isConnected: boolean;
  tableId: string | null;
  tableName: string;
  prepareBillSummary: () => BillSummary | null;
}

export function useStaffCall({
  socket,
  isConnected,
  tableId,
  tableName,
  prepareBillSummary,
}: UseStaffCallProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [staffCallPending, setStaffCallPending] = useState(false);

  const handleStaffRequest = async () => {
    if (!socket || !isConnected || !tableId) {
      toast.error("ไม่สามารถติดต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const summary = prepareBillSummary();
    if (!summary || summary.orders.length === 0) {
      toast.error("ไม่มีออเดอร์ที่พร้อมเช็คบิล");
      return;
    }

    try {
      console.log(
        "🔔 [CUSTOMER] Starting staff call process for table:",
        tableId
      );

      setIsCheckingOut(true);
      setStaffCallPending(true);

      const response = await fetch(`/api/tables/${tableId}/callStaff`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to call staff");
      }

      const result = await response.json();
      console.log("🔔 [CUSTOMER] API response:", result);

      if (result.success) {
        toast.success("ส่งสัญญาณเรียกพนักงานแล้ว! 📞", {
          description: `${tableName} - กำลังรอการตอบกลับ...`,
          duration: 5000,
        });

        const typedSocket = socket as Socket<
          ServerToClientEvents,
          ClientToServerEvents
        >;
        typedSocket.emit("customerCallStaff", {
          tableId,
          tableName,
          timestamp: new Date().toISOString(),
        });

        // เพิ่ม timeout เป็น 30 วินาที (ให้เวลาพนักงานฟังเสียงเพลง)
        window.staffCallTimeout = setTimeout(() => {
          if (staffCallPending) {
            console.log("⏰ [CUSTOMER] Staff call timeout reached");

            setStaffCallPending(false);
            setIsCheckingOut(false);

            toast.warning("การตอบกลับล่าช้า แต่สัญญาณถูกส่งแล้ว", {
              description: "พนักงานอาจกำลังยุ่ง หรือจะมาที่โต๊ะโดยไม่ตอบกลับ",
              duration: 8000,
              action: {
                label: "เรียกใหม่",
                onClick: () => handleStaffRequest(),
              },
            });
          }
        }, 30000); // เพิ่มจาก 15 เป็น 30 วินาที
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (error) {
      console.error("❌ [CUSTOMER] Call staff error:", error);
      toast.error("เกิดข้อผิดพลาดในการเรียกพนักงาน");
      setStaffCallPending(false);
      setIsCheckingOut(false);
    }
  };

  return {
    isCheckingOut,
    staffCallPending,
    handleStaffRequest,
    setIsCheckingOut,
    setStaffCallPending,
  };
}
