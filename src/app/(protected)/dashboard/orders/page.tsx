"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  Loader2,
  Phone,
  Users,
} from "lucide-react";
import { TableManagement } from "../../components/tables/TableManagement";
import { MenuManagement } from "../../components/menu/MenuManagement";
import { MenuItem, Order, Table } from "@/src/app/types/Order";
import { OrdersOverview } from "../../components/Order/OrderOverView";
import { CheckoutButton } from "../../components/tables/CheckoutButton";
import { BillOverview } from "../../components/bills/BillOverview";
import { toast } from "sonner";
import { useSocketContext } from "@/src/app/providers/SocketProvider";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  NewOrderEvent,
  parseOrderStatus,
  parseTableStatus,
  statusMessages,
  CallStaffForBillEvent,
  StaffCalledEvent,
} from "@/src/app/types/socket";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // แยก loading state
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false); // Track if data has been loaded at least once

  // เพิ่ม state สำหรับ call staff notifications
  const [staffCallRequests, setStaffCallRequests] = useState<
    Map<string, CallStaffForBillEvent>
  >(new Map());

  const { socket, isConnected } = useSocketContext();

  // Use refs to prevent duplicate operations
  const fetchDataRef = useRef<Promise<void> | null>(null);
  const lastCheckoutRef = useRef<string>("");
  const staffCallSoundRef = useRef<HTMLAudioElement | null>(null);

  const newOrderAudioRef = useRef<HTMLAudioElement | null>(null);
  const checkoutAudioRef = useRef<HTMLAudioElement | null>(null);

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
        .reduce((sum, order) => {
          const orderTotal =
            order.totalAmount ||
            order.items.reduce(
              (itemSum, item) => itemSum + item.menuItem.price * item.quantity,
              0
            );
          return sum + orderTotal;
        }, 0),
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

  // Improved fetchData - แยก loading states
  const fetchData = useCallback(
    async (isBackground = false) => {
      // Prevent duplicate calls
      if (fetchDataRef.current) {
        return fetchDataRef.current;
      }

      const fetchPromise = (async () => {
        try {
          // Only show loading spinner for initial load or manual refresh
          if (!isBackground) {
            if (!hasDataLoaded) {
              setInitialLoading(true);
            } else {
              setIsRefreshing(true);
            }
          }

          setError(null);

          const [tablesData, menuData, ordersData, billsData] =
            await Promise.all([
              fetch(API_ENDPOINTS.TABLES).then((res) => {
                if (!res.ok)
                  throw new Error(`Failed to fetch tables: ${res.statusText}`);
                return res.json();
              }),
              fetch(API_ENDPOINTS.MENU).then((res) => {
                if (!res.ok)
                  throw new Error(`Failed to fetch menu: ${res.statusText}`);
                return res.json();
              }),
              fetch(API_ENDPOINTS.ORDERS).then((res) => {
                if (!res.ok)
                  throw new Error(`Failed to fetch orders: ${res.statusText}`);
                return res.json();
              }),
              fetch(API_ENDPOINTS.BILLS).then((res) => {
                if (!res.ok)
                  throw new Error(`Failed to fetch bills: ${res.statusText}`);
                return res.json();
              }),
            ]);

          setTables(tablesData);
          setMenuItems(menuData);
          setOrders(ordersData);
          setLastRefresh(new Date());
          setHasDataLoaded(true);

          const billedIds = new Set<string>(
            billsData.flatMap((bill: { orderIds: string[] }) => bill.orderIds)
          );
          setBilledOrderIds(billedIds);

          // Show success toast only for manual refresh
          if (!isBackground && hasDataLoaded) {
            toast.success("รีเฟรชข้อมูลสำเร็จ");
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch data";
          console.error("Failed to fetch data:", err);
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setInitialLoading(false);
          setIsRefreshing(false);
          fetchDataRef.current = null; // Reset ref
        }
      })();

      fetchDataRef.current = fetchPromise;
      return fetchPromise;
    },
    [hasDataLoaded]
  );

  // ฟังก์ชันหยุดเสียง staff call
  const stopStaffCallSound = useCallback(() => {
    const audio = staffCallSoundRef.current;
    if (audio) {
      audio.loop = false;
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        // Initialize audio objects
        newOrderAudioRef.current = new Audio("/soundEffect.mp3");
        checkoutAudioRef.current = new Audio("/checkout.mp3");
        staffCallSoundRef.current = new Audio("/callStaff.mp3");

        // Set properties
        [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
          (audioRef, index) => {
            if (audioRef.current) {
              audioRef.current.volume = index === 2 ? 0.8 : 0.7; // Staff call slightly louder
              audioRef.current.preload = "auto";

              // Add error handlers
              audioRef.current.addEventListener("error", (e) => {
                console.error(`Audio ${index} error:`, e);
              });

              // Add loaded event
              audioRef.current.addEventListener("canplaythrough", () => {
                console.log(`Audio ${index} loaded successfully`);
              });
            }
          }
        );

        // Try to unlock audio context immediately
        const unlockAudio = () => {
          [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
            (audioRef) => {
              if (audioRef.current) {
                const playPromise = audioRef.current.play();
                if (playPromise) {
                  playPromise
                    .then(() => {
                      audioRef.current!.pause();
                      audioRef.current!.currentTime = 0;
                      console.log("Audio context unlocked");
                    })
                    .catch(() => {
                      // Expected to fail, but unlocks the context
                    });
                }
              }
            }
          );
        };

        // Try to unlock on various user interactions
        const events = ["click", "touchstart", "keydown", "mousedown"];
        const unlockHandler = () => {
          unlockAudio();
          events.forEach((event) => {
            document.removeEventListener(event, unlockHandler);
          });
        };

        events.forEach((event) => {
          document.addEventListener(event, unlockHandler, { once: true });
        });
      } catch (error) {
        console.warn("Failed to initialize audio:", error);
      }
    }

    return () => {
      // Cleanup
      [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
        (audioRef) => {
          if (audioRef.current) {
            audioRef.current.removeEventListener("error", () => {});
            audioRef.current.removeEventListener("canplaythrough", () => {});
          }
        }
      );
    };
  }, []);

  const playSound = useCallback(
    async (type: "newOrder" | "checkout" | "staffCall") => {
      let audio: HTMLAudioElement | null = null;
      let soundName = "";

      switch (type) {
        case "newOrder":
          audio = newOrderAudioRef.current;
          soundName = "New Order";
          break;
        case "checkout":
          audio = checkoutAudioRef.current;
          soundName = "Checkout";
          break;
        case "staffCall":
          audio = staffCallSoundRef.current;
          soundName = "Staff Call";
          break;
      }

      if (!audio) {
        console.warn(`${soundName} audio not initialized`);
        return;
      }

      try {
        // Reset audio to beginning
        audio.currentTime = 0;

        // Check if audio is ready
        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            await playPromise;
            console.log(`✅ ${soundName} sound played successfully`);

            // For staff call, play twice for emphasis
            if (type === "staffCall") {
              setTimeout(async () => {
                try {
                  audio!.currentTime = 0;
                  await audio!.play();
                  console.log(`✅ ${soundName} second play completed`);
                } catch (err) {
                  console.warn(`⚠️ ${soundName} second play failed:`, err);
                }
              }, 500);
            }
          }
        } else {
          // Audio not ready, wait for it to load
          console.log(`Audio not ready, waiting for ${soundName}...`);

          const onCanPlay = async () => {
            audio!.removeEventListener("canplaythrough", onCanPlay);
            try {
              audio!.currentTime = 0;
              await audio!.play();
              console.log(`✅ ${soundName} sound played after loading`);
            } catch (err) {
              console.warn(`⚠️ ${soundName} failed after loading:`, err);
            }
          };

          audio.addEventListener("canplaythrough", onCanPlay);

          // Fallback timeout
          setTimeout(() => {
            audio!.removeEventListener("canplaythrough", onCanPlay);
          }, 2000);
        }
      } catch (error: unknown) {
        console.warn(`⚠️ ${soundName} sound failed to play:`, error);
        if (error instanceof Error) {
          // Show user notification for audio issues
          if (error.name === "NotAllowedError") {
            toast.info(`เปิดเสียงแจ้งเตือน ${soundName}`, {
              description: "กรุณาคลิกที่หน้าจอเพื่อเปิดใช้งานเสียง",
              duration: 3000,
              action: {
                label: "เปิดเสียง",
                onClick: () => {
                  // Force unlock audio context
                  [
                    newOrderAudioRef,
                    checkoutAudioRef,
                    staffCallSoundRef,
                  ].forEach((audioRef) => {
                    if (audioRef.current) {
                      audioRef.current
                        .play()
                        .then(() => {
                          audioRef.current!.pause();
                          audioRef.current!.currentTime = 0;
                        })
                        .catch(() => {});
                    }
                  });
                },
              },
            });
          }
        }
      }
    },
    []
  );

  // Socket event handlers with background updates
  const handleNewOrder = useCallback(
    (data: NewOrderEvent) => {
      toast.success(`ออเดอร์ใหม่จากโต๊ะ ${data.tableName || data.tableId}`, {
        description: `${data.itemsCount} รายการ - ฿${data.totalAmount}`,
        duration: 5000, // แสดงนานขึ้น
      });
      playSound("newOrder");

      // Background update - ไม่แสดง loading
      setTimeout(() => {
        fetchData(true); // isBackground = true
      }, 100);
    },
    [fetchData, playSound]
  );

  const handleCallStaffForBill = useCallback(
    (data: CallStaffForBillEvent) => {
      console.log("🔔 Staff call received in dashboard:", data);

      // เล่นเสียงทันทีก่อน
      playSound("staffCall");

      setStaffCallRequests((prev) => new Map(prev.set(data.tableId, data)));

      toast.info(
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-full animate-bounce">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-red-800">
              {data.tableName} ขอเช็คบิล
            </div>
            <div className="text-sm text-red-600">
              {data.orderCount} ออเดอร์ - ฿{data.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>,
        {
          duration: 15000, // แสดงนานขึ้น
          className: "border-red-200 bg-red-50",
          action: {
            label: "ตอบรับ",
            onClick: () => {
              if (socket && isConnected) {
                socket.emit("staffResponseFromDashboard", {
                  tableId: data.tableId,
                  message: "พนักงานได้รับแจ้งแล้ว กำลังเตรียมไปที่โต๊ะ",
                  timestamp: new Date().toISOString(),
                  staffConfirmed: true,
                });
              }

              setStaffCallRequests((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.tableId);
                return newMap;
              });

              toast.success(`ตอบรับ ${data.tableName} แล้ว`);
            },
          },
        }
      );
    },
    [playSound, socket, isConnected]
  );

  // อัปเดต handler สำหรับรับ confirmation
  const handleStaffCalled = useCallback((data: StaffCalledEvent) => {
    console.log("✅ Staff called confirmation received:", data);

    // ลบ request ออกจาก state เมื่อได้รับการยืนยัน
    setStaffCallRequests((prev) => {
      const newMap = new Map(prev);
      newMap.delete(data.tableId);
      return newMap;
    });

    // แสดง toast ยืนยัน
    toast.success("พนักงานได้รับแจ้งแล้ว", {
      description: data.message,
      duration: 3000,
    });
  }, []);

  const handleTableCheckedOut = useCallback(
    (data: {
      tableId: string;
      totalAmount: number;
      timestamp?: string;
      number: string;
      tableName: string;
    }) => {
      // Prevent duplicate notifications
      const checkoutKey = `${data.tableId}-${data.totalAmount}-${
        data.timestamp || Date.now()
      }`;
      if (lastCheckoutRef.current === checkoutKey) {
        return;
      }
      lastCheckoutRef.current = checkoutKey;

      console.log("Table checked out:", data);
      toast.info(`${data.tableName || `โต๊ะ ${data.number}`} เช็คเอาท์แล้ว`, {
        description: `ยอดรวม ฿${data.totalAmount.toLocaleString()}`,
        duration: 5000,
      });

      playSound("checkout");

      // Background update
      setTimeout(() => {
        fetchData(true);
      }, 500);
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

      // Real-time update without API call
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

      // Real-time update without API call
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

    // Background update for bills only
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
  }, []);

  // Single useEffect for socket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("joinDashboard");

    // Remove existing listeners first
    socket.off("newOrder");
    socket.off("orderStatusChanged");
    socket.off("tableStatusChanged");
    socket.off("billCreated");
    socket.off("tableCheckedOut");
    socket.off("callStaffForBill");
    socket.off("staffCalled");

    // Add new listeners
    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusChanged", handleOrderStatusChanged);
    socket.on("tableStatusChanged", handleTableStatusChanged);
    socket.on("billCreated", handleBillCreated);
    socket.on("tableCheckedOut", handleTableCheckedOut);
    socket.on("callStaffForBill", handleCallStaffForBill);
    socket.on("staffCalled", handleStaffCalled);

    return () => {
      console.log("Cleaning up socket listeners...");
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
    handleTableCheckedOut,
    handleCallStaffForBill,
    handleStaffCalled,
  ]);

  // Initial data fetch
  useEffect(() => {
    fetchData(false); // Initial load
  }, [fetchData]);

  const handleOrderStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? updatedOrder : order
          )
        );

        toast.success("อัปเดตสถานะออเดอร์สำเร็จ");

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
        // Revert optimistic update
        fetchData(true);
      }
    },
    [socket, isConnected, fetchData]
  );

  // Menu item handlers (unchanged)
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
    setTimeout(() => {
      fetchData(true);
    }, 300);
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

  // Show initial loading only
  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>กำลังโหลดข้อมูลครั้งแรก...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* ซ้าย */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ระบบจุดขาย (POS)</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-sm text-gray-600">
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

            {/* Background refresh indicator */}
            {isRefreshing && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                กำลังซิงค์...
              </span>
            )}

            {/* Staff call requests indicator */}
            {staffCallRequests.size > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs animate-pulse">
                <Users className="w-3 h-3" />
                {staffCallRequests.size} โต๊ะรอเช็คบิล
              </span>
            )}
          </div>
        </div>

        {/* ขวา */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-md text-sm flex-1 sm:flex-none ${
              autoRefresh
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>

          <button
            onClick={() => fetchData(false)} // Manual refresh
            disabled={isRefreshing || !!fetchDataRef.current}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-1 sm:flex-none"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing || fetchDataRef.current ? "animate-spin" : ""
              }`}
            />
            รีเฟรช
          </button>

          {todayStats.newOrders > 0 && (
            <div className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md animate-pulse flex-1 sm:flex-none">
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

      {/* Staff Call Requests Section */}
      {staffCallRequests.size > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              โต๊ะที่เรียกพนักงานเช็คบิล ({staffCallRequests.size} โต๊ะ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from(staffCallRequests.values()).map((request) => (
                <Card
                  key={request.tableId}
                  className="border border-red-200 bg-white"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-red-800">
                        {request.tableName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.timestamp).toLocaleTimeString(
                          "th-TH"
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {request.orderCount} ออเดอร์
                    </div>
                    <div className="text-lg font-bold text-red-600 mb-3">
                      ฿{request.totalAmount.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          stopStaffCallSound();
                          setStaffCallRequests((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(request.tableId);
                            return newMap;
                          });
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        ไปที่โต๊ะ
                      </button>
                      <button
                        onClick={() => {
                          // ปิดการแจ้งเตือน
                          setStaffCallRequests((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(request.tableId);
                            return newMap;
                          });
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                      >
                        ปิด
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
      {(todayStats.newOrders > 0 ||
        todayStats.preparingOrders > 0 ||
        staffCallRequests.size > 0) && (
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
              {staffCallRequests.size > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm animate-pulse">
                  📞 {staffCallRequests.size} โต๊ะเรียกพนักงาน
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="today-orders" className="space-y-6 w-full">
        <ScrollArea className="w-full">
          <TabsList className="flex gap-2 w-max">
            <TabsTrigger
              value="today-orders"
              className="flex-shrink-0 min-w-fit whitespace-nowrap px-4"
            >
              ออเดอร์วันนี้
              {todayStats.totalOrders > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {todayStats.totalOrders}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="all-orders"
              className="flex-shrink-0 min-w-fit whitespace-nowrap px-4"
            >
              ออเดอร์ทั้งหมด
            </TabsTrigger>

            <TabsTrigger
              value="tables"
              className="flex-shrink-0 min-w-fit whitespace-nowrap px-4"
            >
              จัดการโต๊ะ
            </TabsTrigger>

            <TabsTrigger
              value="menu"
              className="flex-shrink-0 min-w-fit whitespace-nowrap px-4"
            >
              จัดการเมนู
            </TabsTrigger>

            <TabsTrigger
              value="bills"
              className="flex-shrink-0 min-w-fit whitespace-nowrap px-4"
            >
              บิล/รายได้
              <Receipt className="w-4 h-4 ml-1" />
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

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
