import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  CallStaffForBillEvent,
  StaffCalledEvent,
} from "@/src/app/types/socket";
import { SOUND_CONFIG } from "../app/(protected)/constants/api";

export interface UseStaffCallManagementReturn {
  staffCallRequests: Map<string, CallStaffForBillEvent>;
  staffCallTimeouts: Map<string, NodeJS.Timeout>;
  handleCallStaffForBill: (data: CallStaffForBillEvent) => void;
  handleStaffCalled: (data: StaffCalledEvent) => void;
  clearStaffCallRequest: (tableId: string) => void;
  clearAllStaffCallRequests: () => void;
  setStaffCallRequests: React.Dispatch<
    React.SetStateAction<Map<string, CallStaffForBillEvent>>
  >;
}

export const useStaffCallManagement = (
  playSound: (
    type: "newOrder" | "checkout" | "staffCall",
    tableId?: string
  ) => Promise<void>,
  stopStaffCallSound: (tableId?: string) => void
): UseStaffCallManagementReturn => {
  const [staffCallRequests, setStaffCallRequests] = useState<
    Map<string, CallStaffForBillEvent>
  >(new Map());
  const [staffCallTimeouts, setStaffCallTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  const handleCallStaffForBill = useCallback(
    (data: CallStaffForBillEvent) => {
      playSound("staffCall", data.tableId);

      setStaffCallRequests((prev) => new Map(prev.set(data.tableId, data)));

      const timeoutId = setTimeout(() => {
        stopStaffCallSound(data.tableId);
        setStaffCallTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.tableId);
          return newMap;
        });
      }, SOUND_CONFIG.STAFF_CALL_TIMEOUT);

      setStaffCallTimeouts(
        (prev) => new Map(prev.set(data.tableId, timeoutId))
      );
    },
    [playSound, stopStaffCallSound]
  );

  const handleStaffCalled = useCallback((data: StaffCalledEvent) => {
    setStaffCallRequests((prev) => {
      const newMap = new Map(prev);
      newMap.delete(data.tableId);
      return newMap;
    });

    toast.success("พนักงานได้รับแจ้งแล้ว", {
      description: data.message,
      duration: 3000,
    });
  }, []);

  const clearStaffCallRequest = useCallback(
    (tableId: string) => {
      // Clear timeout
      const timeoutId = staffCallTimeouts.get(tableId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setStaffCallTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tableId);
          return newMap;
        });
      }

      // Stop sound
      stopStaffCallSound(tableId);

      // Remove request
      setStaffCallRequests((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tableId);
        return newMap;
      });
    },
    [staffCallTimeouts, stopStaffCallSound]
  );

  const clearAllStaffCallRequests = useCallback(() => {
    // Clear all timeouts
    staffCallTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    setStaffCallTimeouts(new Map());

    // Stop all sounds
    stopStaffCallSound();

    // Clear all requests
    setStaffCallRequests(new Map());

    toast.success("ปิดการแจ้งเตือนทั้งหมดแล้ว");
  }, [staffCallTimeouts, stopStaffCallSound]);

  return {
    staffCallRequests,
    staffCallTimeouts,
    handleCallStaffForBill,
    handleStaffCalled,
    clearStaffCallRequest,
    clearAllStaffCallRequests,
    setStaffCallRequests,
  };
};
