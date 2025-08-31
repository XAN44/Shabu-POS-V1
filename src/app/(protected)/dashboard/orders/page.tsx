"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo,
} from "react";
import { toast } from "sonner";
import { usePOSData } from "@/src/hooks/usePOSData";
import { useSoundEffects } from "@/src/hooks/useSoundEffects";
import { useStaffCallManagement } from "@/src/hooks/useStaffCallManagement";
import { useSocketConnection } from "@/src/hooks/useSocketConnection";
import { LoadingScreen } from "../../components/Dashboard/LoadingScreen";
import { DashboardHeader } from "../../components/Dashboard/DashboardHeader";
import { ErrorMessage } from "../../components/Dashboard/ErrorMessage";
import { StaffCallNotifications } from "../../components/Dashboard/StaffCallNotifications";
import { CheckoutNotifications } from "../../components/Dashboard/CheckoutNotifications";
import LastOrder from "../../components/Order/LastOrder";
import { DashboardStats } from "../../components/Dashboard/DashboardStats";
import { OrdersOverview } from "../../components/Order/OrderOverView";
import { useSocketContext } from "../../../providers/SocketProvider";
import { CallStaffForBillEvent } from "@/src/app/types/socket";

import { getAverageWaitTime } from "../../../utils/averageWaitTime";

// Memoize components to prevent unnecessary re-renders
const MemoizedDashboardHeader = memo(DashboardHeader);
const MemoizedErrorMessage = memo(ErrorMessage);
const MemoizedStaffCallNotifications = memo(StaffCallNotifications);
const MemoizedCheckoutNotifications = memo(CheckoutNotifications);
const MemoizedDashboardStats = memo(DashboardStats);
const MemoizedLastOrder = memo(LastOrder);
const MemoizedOrdersOverview = memo(OrdersOverview);

const OrdersDashboard: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const lastCheckoutRef = useRef<string>("");
  const isInitialized = useRef(false);

  // Use custom hooks
  const posData = usePOSData();
  const {
    orders,
    billedOrderIds,
    initialLoading,
    isRefreshing,
    error,
    setError,
    lastRefresh,
    todayOrders,
    todayStats,
    tableStats,
    tablesReadyForCheckout,
    fetchData,
    handleOrderStatusChange,
    handleCheckoutComplete,
    setOrders,
    setTables,
    setBilledOrderIds,
    hasDataLoaded,
  } = posData;

  const { playSound, stopStaffCallSound, soundPlayingTables } =
    useSoundEffects();

  const {
    staffCallRequests,
    handleCallStaffForBill,
    handleStaffCalled,
    clearStaffCallRequest,
    clearAllStaffCallRequests,
  } = useStaffCallManagement(playSound, stopStaffCallSound);

  const { socket, isConnected } = useSocketContext();
  const fetchDataRef = useRef<Promise<void> | null>(null);

  const handleTableCheckedOut = useCallback(
    (data: {
      tableId: string;
      totalAmount: number;
      timestamp?: string;
      number: string;
      tableName: string;
    }) => {
      const checkoutKey = `${data.tableId}-${data.totalAmount}-${
        data.timestamp || Date.now()
      }`;
      if (lastCheckoutRef.current === checkoutKey) {
        return;
      }
      lastCheckoutRef.current = checkoutKey;

      toast.info(`${data.tableName || `โต๊ะ ${data.number}`} เช็คเอาท์แล้ว`, {
        description: `ยอดรวม ฿${data.totalAmount.toLocaleString()}`,
        duration: 5000,
      });

      playSound("checkout");

      setTimeout(() => {
        if (hasDataLoaded) {
          fetchData(true);
        }
      }, 500);
    },
    [fetchData, playSound, hasDataLoaded]
  );

  // Setup socket connection - only after initial data is loaded
  useSocketConnection({
    orders,
    setOrders,
    setTables,
    setBilledOrderIds,
    fetchData,
    playSound,
    onCallStaffForBill: handleCallStaffForBill,
    onStaffCalled: handleStaffCalled,
    onTableCheckedOut: handleTableCheckedOut,
    stopStaffCallSound,
  });

  // Initialize only once
  useEffect(() => {
    if (!isInitialized.current && !initialLoading && !hasDataLoaded) {
      console.log("OrdersDashboard: Initializing...");
      isInitialized.current = true;
    }
  }, [initialLoading, hasDataLoaded]);

  const handleStaffCallResponse = useCallback(
    (tableId: string, request: CallStaffForBillEvent) => {
      clearStaffCallRequest(tableId);

      if (socket && isConnected) {
        socket.emit("staffResponseFromDashboard", {
          tableId: request.tableId,
          message: "พนักงานได้รับแจ้งแล้ว กำลังเตรียมไปที่โต๊ะ",
          timestamp: new Date().toISOString(),
          staffConfirmed: true,
        });
      }

      toast.success(`กำลังไปที่ ${request.tableName}`);
    },
    [clearStaffCallRequest, socket, isConnected]
  );

  // Memoize expensive calculations
  const averageWaitTime = useMemo(
    () => getAverageWaitTime(todayOrders),
    [todayOrders]
  );

  // Callback functions with stable references
  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefresh(!autoRefresh);
  }, [autoRefresh]);

  const handleRefresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, [setError]);

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <MemoizedDashboardHeader
          lastRefresh={lastRefresh}
          isConnected={isConnected}
          isRefreshing={isRefreshing}
          newOrdersCount={todayStats.newOrders}
          staffCallCount={staffCallRequests.size}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          onRefresh={handleRefresh}
          fetchDataRef={fetchDataRef}
        />

        {/* Error Message */}
        {error && (
          <MemoizedErrorMessage error={error} onDismiss={handleDismissError} />
        )}

        {/* Staff Call Notifications */}
        <MemoizedStaffCallNotifications
          staffCallRequests={staffCallRequests}
          soundPlayingTables={soundPlayingTables}
          onRespondToCall={handleStaffCallResponse}
          onDismissCall={clearStaffCallRequest}
          onClearAll={clearAllStaffCallRequests}
        />

        {/* Checkout Notifications */}
        <MemoizedCheckoutNotifications
          tablesReadyForCheckout={tablesReadyForCheckout}
          orders={orders}
          billedOrderIds={billedOrderIds}
          onCheckoutComplete={handleCheckoutComplete}
        />

        {/* Statistics */}
        <MemoizedDashboardStats
          todayStats={todayStats}
          tableStats={tableStats}
          averageWaitTime={averageWaitTime}
        />

        {/* Recent Orders */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <MemoizedLastOrder
            orders={todayOrders}
            onOrderStatusChange={handleOrderStatusChange}
            title="ออเดอร์ล่าสุด (วันนี้)"
            showTimeAgo={true}
          />
        </div>

        {/* All Orders */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <MemoizedOrdersOverview
            orders={orders}
            onOrderStatusChange={handleOrderStatusChange}
            title="ออเดอร์ทั้งหมด"
            showTimeAgo={false}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(OrdersDashboard);
