"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Table as TableIcon,
  Menu,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  Bell,
  Wifi,
  WifiOff,
  Receipt,
} from "lucide-react";
import { TableManagement } from "../../components/tables/TableManagement";
import { MenuManagement } from "../../components/menu/MenuManagement";
import { MenuItem, Order, Table } from "@/src/app/types/Order";
import { OrdersOverview } from "../../components/Order/OrderOverView";
import { CheckoutButton } from "../../components/tables/CheckoutButton";
import { BillOverview } from "../../components/bills/BillOverview";
import { toast } from "sonner";
import { useSocketContext } from "@/src/app/providers/SocketProvider";
import {
  NewOrderEvent,
  statusMessages,
  parseOrderStatus,
  parseTableStatus,
} from "@/src/app/types/socket-event";

// Constants
const API_ENDPOINTS = {
  TABLES: "/api/tables",
  MENU: "/api/menu",
  ORDERS: "/api/orders",
  BILLS: "/api/bills",
} as const;

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { socket, isConnected } = useSocketContext();

  const todayOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return orders.filter((order) => {
      const orderDate = new Date(order.orderTime);
      return orderDate >= today && orderDate < tomorrow;
    });
  }, [orders]);

  const todayStats = useMemo(
    () => ({
      totalOrders: todayOrders.length,
      newOrders: todayOrders.filter((o) => o.status === "new").length,
      preparingOrders: todayOrders.filter((o) => o.status === "preparing")
        .length,
      readyOrders: todayOrders.filter((o) => o.status === "ready").length,
      servedOrders: todayOrders.filter((o) => o.status === "served").length,
      todayRevenue: todayOrders
        .filter((o) => o.status === "served")
        .reduce((sum, order) => sum + order.totalAmount, 0),
    }),
    [todayOrders]
  );

  const tableStats = useMemo(
    () => ({
      availableTables: tables.filter((t) => t.status === "available").length,
      occupiedTables: tables.filter((t) => t.status === "occupied").length,
      reservedTables: tables.filter((t) => t.status === "reserved").length,
    }),
    [tables]
  );

  // API functions with better error handling
  const fetchWithErrorHandling = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchExistingBills = useCallback(async () => {
    try {
      const bills: Array<{ orderIds: string[] }> = await fetchWithErrorHandling(
        API_ENDPOINTS.BILLS
      );
      const billedIds = new Set<string>(bills.flatMap((bill) => bill.orderIds));
      setBilledOrderIds(billedIds);
    } catch (error) {
      console.error("Failed to fetch existing bills:", error);
      // Don't show error toast for bills as it's not critical
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tablesData, menuData, ordersData, billsData] = await Promise.all([
        fetchWithErrorHandling(API_ENDPOINTS.TABLES),
        fetchWithErrorHandling(API_ENDPOINTS.MENU),
        fetchWithErrorHandling(API_ENDPOINTS.ORDERS),
        fetchWithErrorHandling(API_ENDPOINTS.BILLS),
      ]);

      setTables(tablesData);
      setMenuItems(menuData);
      setOrders(ordersData);
      setLastRefresh(new Date());

      // Update billed order IDs
      const billedIds = new Set<string>(
        billsData.flatMap((bill: { orderIds: string[] }) => bill.orderIds)
      );
      setBilledOrderIds(billedIds);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      console.error("Failed to fetch data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Socket event handlers
  const handleNewOrder = useCallback(
    (data: NewOrderEvent) => {
      toast.success(`ออเดอร์ใหม่จากโต๊ะ ${data.tableName || data.tableId}`, {
        description: `${data.itemsCount} รายการ - ฿${data.totalAmount}`,
      });
      // Play notification sound
      if ("Audio" in window) {
        const audio = new Audio("/soundEffect.mp3");
        audio.volume = 1;

        audio.play().catch(() => {
          console.warn("เสียงแจ้งเตือนถูก block โดย browser");
        });
      }
      fetchData();
    },
    [fetchData]
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
    []
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
    []
  );

  const handleBillCreated = useCallback(() => {
    toast.success(`สร้างบิลสำเร็จ!`);
    fetchExistingBills();
  }, [fetchExistingBills]);

  // Setup Socket.IO Event Listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("joinDashboard");

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusChanged", handleOrderStatusChanged);
    socket.on("tableStatusChanged", handleTableStatusChanged);
    socket.on("billCreated", handleBillCreated);

    return () => {
      socket.emit("leaveDashboard");
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusChanged", handleOrderStatusChanged);
      socket.off("tableStatusChanged", handleTableStatusChanged);
      socket.off("billCreated", handleBillCreated);
    };
  }, [
    socket,
    isConnected,
    handleNewOrder,
    handleOrderStatusChanged,
    handleTableStatusChanged,
    handleBillCreated,
  ]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOrderStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
        const parsedStatus = parseOrderStatus(newStatus);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: parsedStatus } : order
          )
        );

        const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: parsedStatus }),
        });

        if (!response.ok) {
          // ✅ Revert the optimistic update on error
          const updatedOrder = await response.json();
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? updatedOrder : order
            )
          );
          throw new Error(
            `Failed to update order status: ${response.statusText}`
          );
        }

        // ✅ Get the updated order from server response
        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? updatedOrder : order
          )
        );

        toast.success("อัปเดตสถานะออเดอร์สำเร็จ");

        // ✅ Emit socket event to notify other clients (if your server supports this)
        if (socket && isConnected) {
          socket.emit("orderStatusUpdate", {
            orderId,
            status: parsedStatus,
            tableId: updatedOrder.tableId,
          });
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        const errorMessage = "ไม่สามารถอัปเดตสถานะออเดอร์ได้";
        setError(errorMessage);
        toast.error(errorMessage);

        // ✅ Revert optimistic update on error by refetching data
        fetchData();
      }
    },
    [socket, isConnected, fetchData]
  );

  // Menu item handlers
  const handleAddMenuItem = useCallback(
    async (newMenuItem: Omit<MenuItem, "id">) => {
      try {
        const response = await fetch(API_ENDPOINTS.MENU, {
          method: "POST",
          body: JSON.stringify(newMenuItem),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to add menu item: ${response.statusText}`);
        }

        const createdItem = await response.json();
        setMenuItems((prev) => [...prev, createdItem]);
        toast.success("เพิ่มเมนูสำเร็จ");
      } catch (error) {
        console.error("Error adding menu item:", error);
        const errorMessage = "ไม่สามารถเพิ่มเมนูได้";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    []
  );

  const handleEditMenuItem = useCallback(
    async (itemId: string, updates: Partial<MenuItem>) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.MENU}/${itemId}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to edit menu item: ${response.statusText}`);
        }

        const updatedItem = await response.json();
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? updatedItem : item))
        );
        toast.success("แก้ไขเมนูสำเร็จ");
      } catch (error) {
        console.error("Error editing menu item:", error);
        const errorMessage = "ไม่สามารถแก้ไขเมนูได้";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    []
  );

  const handleDeleteMenuItem = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete menu item: ${response.statusText}`);
      }

      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("ลบเมนูสำเร็จ");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      const errorMessage = "ไม่สามารถลบเมนูได้";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const handleCheckoutComplete = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Get tables with pending orders
  const tablesWithPendingOrders = useMemo(() => {
    return tables.filter((table) => {
      const tableOrders = orders.filter(
        (order) =>
          order.tableId === table.id &&
          order.status !== "cancelled" &&
          !billedOrderIds.has(order.id)
      );
      return tableOrders.length > 0;
    });
  }, [tables, orders, billedOrderIds]);

  // Calculate average wait time
  const getAverageWaitTime = useCallback(() => {
    const activeOrders = todayOrders.filter((o) =>
      ["new", "preparing", "ready"].includes(o.status)
    );
    if (activeOrders.length === 0) return 0;

    const totalMinutes = activeOrders.reduce((sum, order) => {
      const orderTime = new Date(order.orderTime);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - orderTime.getTime()) / (1000 * 60)
      );
      return sum + diffMinutes;
    }, 0);

    return Math.round(totalMinutes / activeOrders.length);
  }, [todayOrders]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ระบบจุดขาย (POS)</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("th-TH")}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString("th-TH")}
            </span>
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isConnected ? "เชื่อมต่อแล้ว" : "ไม่เชื่อมต่อ"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-md text-sm ${
              autoRefresh
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            รีเฟรช
          </button>
          {todayStats.newOrders > 0 && (
            <div className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md animate-pulse">
              <Bell className="w-4 h-4 mr-2" />
              {todayStats.newOrders} ออเดอร์ใหม่
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              ปิด
            </button>
          </CardContent>
        </Card>
      )}

      {/* Quick Checkout Section */}
      {tablesWithPendingOrders.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              โต๊ะที่พร้อมเช็คบิล ({tablesWithPendingOrders.length} โต๊ะ)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tablesWithPendingOrders.map((table) => {
                const unbilledOrders = orders.filter(
                  (order) =>
                    order.tableId === table.id &&
                    order.status !== "cancelled" &&
                    !billedOrderIds.has(order.id)
                );
                return (
                  <Card key={table.id} className="border border-green-200">
                    <CardContent className="p-3 text-center">
                      <div className="font-semibold mb-2">
                        โต๊ะ {table.number}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {unbilledOrders.length} ออเดอร์
                        <div className="text-xs text-green-600 font-medium">
                          ฿
                          {unbilledOrders
                            .reduce((sum, order) => sum + order.totalAmount, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <CheckoutButton
                        table={table}
                        orders={orders}
                        onCheckoutComplete={handleCheckoutComplete}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              ฿{todayStats.todayRevenue.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">ยอดขายวันนี้</div>
          </CardContent>
        </Card>

        <Card
          className={
            todayStats.newOrders > 0
              ? "bg-red-500 text-white animate-pulse"
              : ""
          }
        >
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{todayStats.newOrders}</div>
            <div className="text-xs opacity-90">ออเดอร์ใหม่</div>
          </CardContent>
        </Card>

        <Card
          className={
            todayStats.preparingOrders > 0 ? "bg-orange-500 text-white" : ""
          }
        >
          <CardContent className="p-4 text-center">
            <Menu className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {todayStats.preparingOrders}
            </div>
            <div className="text-xs opacity-90">กำลังทำ</div>
          </CardContent>
        </Card>

        <Card
          className={todayStats.readyOrders > 0 ? "bg-blue-500 text-white" : ""}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{todayStats.readyOrders}</div>
            <div className="text-xs opacity-90">พร้อมเสิร์ฟ</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{todayStats.totalOrders}</div>
            <div className="text-xs text-gray-600">ออเดอร์วันนี้</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TableIcon className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {tableStats.availableTables}
            </div>
            <div className="text-xs text-gray-600">โต๊ะว่าง</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TableIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">
              {tableStats.occupiedTables}
            </div>
            <div className="text-xs text-gray-600">โต๊ะมีลูกค้า</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{getAverageWaitTime()}</div>
            <div className="text-xs text-gray-600">นาทีเฉลี่ย</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(todayStats.newOrders > 0 || todayStats.preparingOrders > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-orange-800 mb-2">
              การดำเนินการด่วน
            </h3>
            <div className="flex gap-2 flex-wrap">
              {todayStats.newOrders > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  🔴 {todayStats.newOrders} ออเดอร์รอการยืนยัน
                </span>
              )}
              {todayStats.preparingOrders > 0 && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  👨‍🍳 {todayStats.preparingOrders} ออเดอร์อยู่ในครัว
                </span>
              )}
              {todayStats.readyOrders > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  ✅ {todayStats.readyOrders} ออเดอร์พร้อมเสิร์ฟ
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="today-orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today-orders">
            ออเดอร์วันนี้
            {todayStats.totalOrders > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {todayStats.totalOrders}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-orders">ออเดอร์ทั้งหมด</TabsTrigger>
          <TabsTrigger value="tables">จัดการโต๊ะ</TabsTrigger>
          <TabsTrigger value="menu">จัดการเมนู</TabsTrigger>
          <TabsTrigger value="bills">
            บิล/รายได้
            <Receipt className="w-4 h-4 ml-1" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today-orders">
          <OrdersOverview
            orders={todayOrders}
            onOrderStatusChange={handleOrderStatusChange}
            title="ออเดอร์วันนี้"
            showTimeAgo={true}
          />
        </TabsContent>

        <TabsContent value="all-orders">
          <OrdersOverview
            orders={orders}
            onOrderStatusChange={handleOrderStatusChange}
            title="ออเดอร์ทั้งหมด"
            showTimeAgo={false}
          />
        </TabsContent>

        <TabsContent value="tables">
          <TableManagement />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onEditMenuItem={handleEditMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        </TabsContent>

        <TabsContent value="bills">
          <BillOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersDashboard;
