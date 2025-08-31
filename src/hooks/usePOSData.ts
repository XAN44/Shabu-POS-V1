import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { MenuItem, Order, Table } from "@/src/app/types/Order";
import { API_ENDPOINTS } from "../app/(protected)/constants/api";

export interface POSStats {
  completedOrders: number;
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  readyOrders: number;
  servedOrders: number;
  inProgressOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface TableStats {
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  available: number;
  occupied: number;
  reserved: number;
  needsCheckout: number;
}

export interface UsePOSDataReturn {
  // Data
  orders: Order[];
  tables: Table[];
  menuItems: MenuItem[];
  billedOrderIds: Set<string>;

  // Loading states
  initialLoading: boolean;
  isRefreshing: boolean;
  hasDataLoaded: boolean;
  isMounted: boolean;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Timestamps
  lastRefresh: Date;

  // Stats
  todayOrders: Order[];
  todayStats: POSStats;
  tableStats: TableStats;
  tablesReadyForCheckout: Table[];

  // Functions
  fetchData: (isBackground?: boolean) => Promise<void>;
  handleOrderStatusChange: (
    orderId: string,
    newStatus: string
  ) => Promise<void>;
  handleAddMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  handleEditMenuItem: (
    itemId: string,
    updates: Partial<MenuItem>
  ) => Promise<void>;
  handleDeleteMenuItem: (itemId: string) => Promise<void>;
  handleCheckoutComplete: () => Promise<void>;

  // Setters
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setBilledOrderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const usePOSData = (): UsePOSDataReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchDataRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const isInitialFetchDone = useRef(false);

  // Safe abort function that doesn't throw
  const safeAbort = useCallback((controller: AbortController | null) => {
    if (!controller) return;

    try {
      // Only abort if not already aborted
      if (!controller.signal.aborted) {
        controller.abort();
      }
    } catch (err) {
      // Silently ignore all abort errors
      console.log("Safe abort - ignoring error:", err);
    }
  }, []);

  // Track component mount status
  useEffect(() => {
    console.log("usePOSData: Component mounting...");
    setIsMounted(true);
    mountedRef.current = true;

    return () => {
      console.log("usePOSData: Component unmounting...");
      setIsMounted(false);
      mountedRef.current = false;

      // Safe cleanup of abort controller
      safeAbort(abortControllerRef.current);
      abortControllerRef.current = null;

      // Clear fetch promise
      fetchDataRef.current = null;
    };
  }, [safeAbort]);

  const todayOrders = useMemo(() => {
    if (!orders.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return orders.filter((order) => {
      const orderDate = new Date(order.orderTime);
      return orderDate >= today && orderDate < tomorrow;
    });
  }, [orders]);

  const todayStats = useMemo((): POSStats => {
    if (!todayOrders.length) {
      return {
        totalOrders: 0,
        newOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        servedOrders: 0,
        completedOrders: 0,
        inProgressOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
      };
    }

    const totalRevenue = todayOrders
      .filter((o) => o.status === "served")
      .reduce((sum, order) => {
        const orderTotal =
          order.totalAmount ||
          order.items.reduce(
            (itemSum, item) =>
              itemSum + (item.menuItem?.price ?? 0) * item.quantity,
            0
          );
        return sum + orderTotal;
      }, 0);

    return {
      totalOrders: todayOrders.length,
      newOrders: todayOrders.filter((o) => o.status === "new").length,
      preparingOrders: todayOrders.filter((o) => o.status === "preparing")
        .length,
      readyOrders: todayOrders.filter((o) => o.status === "ready").length,
      servedOrders: todayOrders.filter((o) => o.status === "served").length,
      completedOrders: todayOrders.filter((o) => o.status === "served").length,
      inProgressOrders: todayOrders.filter((o) =>
        ["preparing", "ready"].includes(o.status)
      ).length,
      totalRevenue,
      todayRevenue: totalRevenue,
    };
  }, [todayOrders]);

  const tableStats = useMemo((): TableStats => {
    if (!tables.length) {
      return {
        availableTables: 0,
        occupiedTables: 0,
        reservedTables: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        needsCheckout: 0,
      };
    }

    const available = tables.filter((t) => t.status === "available").length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;

    const needsCheckout = tables.filter((table) => {
      if (!orders.length) return false;

      const unbilledOrders = orders.filter(
        (order) =>
          order.tableId === table.id &&
          order.status !== "cancelled" &&
          !billedOrderIds.has(order.id)
      );
      return (
        unbilledOrders.length > 0 &&
        unbilledOrders.every((order) => order.status === "served")
      );
    }).length;

    return {
      availableTables: available,
      occupiedTables: occupied,
      reservedTables: reserved,
      available,
      occupied,
      reserved,
      needsCheckout,
    };
  }, [tables, orders, billedOrderIds]);

  const tablesReadyForCheckout = useMemo(() => {
    if (!tables.length || !orders.length) return [];

    return tables.filter((table) => {
      const unbilledOrders = orders.filter(
        (order) =>
          order.tableId === table.id &&
          order.status !== "cancelled" &&
          !billedOrderIds.has(order.id)
      );

      return (
        unbilledOrders.length > 0 &&
        unbilledOrders.every((order) => order.status === "served")
      );
    });
  }, [tables, orders, billedOrderIds]);

  // Main fetch function without AbortController complications
  const performDataFetch = useCallback(
    async (isBackground: boolean) => {
      console.log("usePOSData: Starting data fetch...", {
        isBackground,
        mounted: mountedRef.current,
      });

      if (!mountedRef.current) {
        console.log("usePOSData: Component not mounted, aborting fetch");
        return;
      }

      try {
        // Set loading states only if component is mounted
        if (!isBackground && mountedRef.current) {
          if (!hasDataLoaded) {
            setInitialLoading(true);
          } else {
            setIsRefreshing(true);
          }
          setError(null);
        }

        console.log("usePOSData: Fetching all endpoints...");

        // Fetch all data without AbortController to avoid abort issues
        const [tablesRes, menuRes, ordersRes, billsRes] = await Promise.all([
          fetch(API_ENDPOINTS.TABLES, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
          fetch(API_ENDPOINTS.MENU, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
          fetch(API_ENDPOINTS.ORDERS, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
          fetch(API_ENDPOINTS.BILLS, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
        ]);

        // Check if component is still mounted after fetch
        if (!mountedRef.current) {
          console.log("usePOSData: Component unmounted during fetch, aborting");
          return;
        }

        // Validate responses
        const responses = [
          { res: tablesRes, name: "Tables" },
          { res: menuRes, name: "Menu" },
          { res: ordersRes, name: "Orders" },
          { res: billsRes, name: "Bills" },
        ];

        for (const { res, name } of responses) {
          if (!res.ok) {
            throw new Error(
              `${name} API error: ${res.status} ${res.statusText}`
            );
          }
        }

        // Parse JSON data
        const [tablesData, menuData, ordersData, billsData] = await Promise.all(
          [tablesRes.json(), menuRes.json(), ordersRes.json(), billsRes.json()]
        );

        console.log("usePOSData: Data fetched successfully:", {
          tables: tablesData?.length || 0,
          menu: menuData?.length || 0,
          orders: ordersData?.length || 0,
          bills: billsData?.length || 0,
        });

        // Final mount check before updating state
        if (!mountedRef.current) {
          console.log("usePOSData: Component unmounted during JSON parsing");
          return;
        }

        // Update state safely
        setTables(Array.isArray(tablesData) ? tablesData : []);
        setMenuItems(Array.isArray(menuData) ? menuData : []);

        // Process bills data
        const billedIdsMap = new Map<string, string>();
        const billSessionMap = new Map<
          string,
          { billId: string; paymentTime: string }
        >();

        if (Array.isArray(billsData)) {
          billsData.forEach(
            (bill: {
              id: string;
              orderIds: string[];
              paymentTime: string;
              tableId: string;
            }) => {
              const sessionKey = `${bill.id}_${bill.paymentTime}_${bill.tableId}`;

              if (Array.isArray(bill.orderIds)) {
                bill.orderIds.forEach((orderId) => {
                  billedIdsMap.set(orderId, sessionKey);
                  billSessionMap.set(sessionKey, {
                    billId: bill.id,
                    paymentTime: bill.paymentTime,
                  });
                });
              }
            }
          );
        }

        // Process orders data
        const ordersWithBillSession = ordersData.map((order: Order) => ({
          ...order,
          billId: billedIdsMap.get(order.id) ?? null,
        }));

        setOrders(ordersWithBillSession);

        const billedIdsSet = new Set<string>(
          Array.isArray(billsData)
            ? billsData.flatMap((bill: { orderIds: string[] }) =>
                Array.isArray(bill.orderIds) ? bill.orderIds : []
              )
            : []
        );
        setBilledOrderIds(billedIdsSet);

        setLastRefresh(new Date());
        setHasDataLoaded(true);

        if (!isBackground && hasDataLoaded && mountedRef.current) {
          toast.success("รีเฟรชข้อมูลสำเร็จ");
        }
      } catch (err) {
        console.error("usePOSData: Failed to fetch data:", err);

        const errorMessage =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล";

        if (mountedRef.current) {
          setError(errorMessage);
          if (!isBackground) {
            toast.error(errorMessage);
          }
        }
      } finally {
        // Safe cleanup
        if (mountedRef.current) {
          setInitialLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [hasDataLoaded]
  );

  const fetchData = useCallback(
    async (isBackground = false) => {
      console.log("usePOSData: fetchData called", {
        isBackground,
        hasDataLoaded,
        mounted: mountedRef.current,
      });

      if (!mountedRef.current) {
        console.log("usePOSData: Component not mounted, skipping fetch");
        return;
      }

      // Prevent duplicate fetches
      if (fetchDataRef.current) {
        console.log(
          "usePOSData: Fetch already in progress, returning existing promise"
        );
        return fetchDataRef.current;
      }

      const fetchPromise = performDataFetch(isBackground);
      fetchDataRef.current = fetchPromise;

      try {
        await fetchPromise;
      } finally {
        fetchDataRef.current = null;
      }
    },
    [performDataFetch, hasDataLoaded]
  );

  // Auto-fetch data on mount - Only once
  useEffect(() => {
    if (isMounted && !hasDataLoaded && !isInitialFetchDone.current) {
      console.log("usePOSData: Auto-fetching data on mount");
      isInitialFetchDone.current = true;
      fetchData(false);
    }
  }, [isMounted, hasDataLoaded, fetchData]);

  // Simplified API handlers without AbortController
  const handleOrderStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      if (!mountedRef.current) return;

      try {
        const { parseOrderStatus } = await import("@/src/app/types/socket");
        const parsedStatus = parseOrderStatus(newStatus);

        // Optimistic update
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
          throw new Error(
            `Failed to update order status: ${response.statusText}`
          );
        }

        const updatedOrder = await response.json();

        if (mountedRef.current) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? updatedOrder : order
            )
          );
          toast.success("อัปเดตสถานะออเดอร์สำเร็จ");
        }
      } catch (error) {
        console.error("Error updating order status:", error);

        if (mountedRef.current) {
          setError("ไม่สามารถอัปเดตสถานะออเดอร์ได้");
          toast.error("ไม่สามารถอัปเดตสถานะออเดอร์ได้");
          // Revert optimistic update by refetching
          fetchData(true);
        }
      }
    },
    [fetchData]
  );

  const handleAddMenuItem = useCallback(async (item: Omit<MenuItem, "id">) => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(API_ENDPOINTS.MENU, {
        method: "POST",
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to add menu item: ${response.statusText}`);
      }

      const createdItem = await response.json();

      if (mountedRef.current) {
        setMenuItems((prev) => [...prev, createdItem]);
        toast.success("เพิ่มเมนูสำเร็จ");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);

      if (mountedRef.current) {
        toast.error("ไม่สามารถเพิ่มเมนูได้");
      }
    }
  }, []);

  const handleEditMenuItem = useCallback(
    async (itemId: string, updates: Partial<MenuItem>) => {
      if (!mountedRef.current) return;

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

        if (mountedRef.current) {
          setMenuItems((prev) =>
            prev.map((item) => (item.id === itemId ? updatedItem : item))
          );
          toast.success("แก้ไขเมนูสำเร็จ");
        }
      } catch (error) {
        console.error("Error editing menu item:", error);

        if (mountedRef.current) {
          setError("ไม่สามารถแก้ไขเมนูได้");
          toast.error("ไม่สามารถแก้ไขเมนูได้");
        }
      }
    },
    []
  );

  const handleDeleteMenuItem = useCallback(async (itemId: string) => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MENU}/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete menu item: ${response.statusText}`);
      }

      if (mountedRef.current) {
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("ลบเมนูสำเร็จ");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);

      if (mountedRef.current) {
        setError("ไม่สามารถลบเมนูได้");
        toast.error("ไม่สามารถลบเมนูได้");
      }
    }
  }, []);

  const handleCheckoutComplete = useCallback(async () => {
    if (!mountedRef.current) return;

    setTimeout(() => {
      if (mountedRef.current) {
        fetchData(true);
      }
    }, 300);
  }, [fetchData]);

  return {
    // Data
    orders,
    tables,
    menuItems,
    billedOrderIds,

    // Loading states
    initialLoading,
    isRefreshing,
    hasDataLoaded,
    isMounted,

    // Error state
    error,
    setError,

    // Timestamps
    lastRefresh,

    // Stats
    todayOrders,
    todayStats,
    tableStats,
    tablesReadyForCheckout,

    // Functions
    fetchData,
    handleOrderStatusChange,
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
    handleCheckoutComplete,

    // Setters
    setOrders,
    setTables,
    setMenuItems,
    setBilledOrderIds,
  };
};
