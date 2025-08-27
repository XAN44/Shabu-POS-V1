"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowUp,
  Zap,
  Activity,
  Timer,
  X,
} from "lucide-react";
import { TableManagement } from "../components/tables/TableManagement";
import { MenuManagement } from "../components/menu/MenuManagement";
import { MenuItem, Order, Table } from "@/src/app/types/Order";
import { OrdersOverview } from "../components/Order/OrderOverView";
import { CheckoutButton } from "../components/tables/CheckoutButton";
import { BillOverview } from "../components/bills/BillOverview";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const [staffCallTimeouts, setStaffCallTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
  const [soundPlayingTables, setSoundPlayingTables] = useState<Set<string>>(
    new Set()
  );

  const [staffCallRequests, setStaffCallRequests] = useState<
    Map<string, CallStaffForBillEvent>
  >(new Map());

  const { socket, isConnected } = useSocketContext();

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

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (fetchDataRef.current) {
        return fetchDataRef.current;
      }

      const fetchPromise = (async () => {
        try {
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
          fetchDataRef.current = null;
        }
      })();

      fetchDataRef.current = fetchPromise;
      return fetchPromise;
    },
    [hasDataLoaded]
  );

  const stopStaffCallSound = useCallback((tableId?: string) => {
    const audio = staffCallSoundRef.current;

    if (tableId) {
      // หยุดเสียงสำหรับโต๊ะเฉพาะ
      setSoundPlayingTables((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tableId);

        // หยุดเสียงถ้าไม่มีโต๊ะไหนเล่นแล้ว
        if (newSet.size === 0 && audio) {
          audio.pause();
          audio.currentTime = 0;
          console.log(`🔇 Stopped staff call sound for table ${tableId}`);
        }

        return newSet;
      });
    } else {
      // หยุดเสียงทั้งหมด
      setSoundPlayingTables(new Set());
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔇 Stopped all staff call sounds");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        newOrderAudioRef.current = new Audio("/soundEffect.mp3");
        checkoutAudioRef.current = new Audio("/checkout.mp3");
        staffCallSoundRef.current = new Audio("/callStaff.mp3");

        [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
          (audioRef, index) => {
            if (audioRef.current) {
              audioRef.current.volume = index === 2 ? 0.8 : 0.7;
              audioRef.current.preload = "auto";

              audioRef.current.addEventListener("error", (e) => {
                console.error(`Audio ${index} error:`, e);
              });

              audioRef.current.addEventListener("canplaythrough", () => {
                console.log(`Audio ${index} loaded successfully`);
              });
            }
          }
        );

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
                    .catch(() => {});
                }
              }
            }
          );
        };

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
    async (type: "newOrder" | "checkout" | "staffCall", tableId?: string) => {
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
        audio.currentTime = 0;

        if (audio.readyState >= 2) {
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            await playPromise;
            console.log(`✅ ${soundName} sound played successfully`);

            // สำหรับเสียงเรียกพนักงาน - เล่นแบบลูปจนกว่าจะถูกหยุด
            if (type === "staffCall" && tableId) {
              setSoundPlayingTables((prev) => new Set(prev).add(tableId));

              // ฟังก์ชันลูปเสียง
              const loopSound = () => {
                // เช็คว่าโต๊ะนี้ยังต้องเล่นเสียงอยู่หรือไม่
                setSoundPlayingTables((current) => {
                  if (current.has(tableId) && audio) {
                    // รอให้เสียงเล่นจบก่อนเล่นรอบใหม่
                    const playNext = () => {
                      if (current.has(tableId)) {
                        try {
                          audio.currentTime = 0;
                          audio
                            .play()
                            .then(() => {
                              console.log(
                                `🔄 ${soundName} loop play for table ${tableId}`
                              );
                              // เซ็ต timeout สำหรับการเล่นรอบถัดไป
                              setTimeout(() => {
                                setSoundPlayingTables((stillCurrent) => {
                                  if (stillCurrent.has(tableId)) {
                                    loopSound(); // เรียกตัวเองเพื่อเล่นต่อ
                                  }
                                  return stillCurrent;
                                });
                              }, 1000); // รอ 1 วินาทีระหว่างการเล่น
                            })
                            .catch((err) => {
                              console.warn(`⚠️ ${soundName} loop failed:`, err);
                              // หยุดเล่นถ้าเกิดข้อผิดพลาด
                              setSoundPlayingTables((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(tableId);
                                return newSet;
                              });
                            });
                        } catch (err) {
                          console.warn(`⚠️ ${soundName} loop error:`, err);
                          setSoundPlayingTables((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(tableId);
                            return newSet;
                          });
                        }
                      }
                    };

                    // เริ่มเล่นทันทีหรือรอให้เสียงปัจจุบันจบก่อน
                    if (audio.ended || audio.paused) {
                      playNext();
                    } else {
                      // รอให้เสียงปัจจุบันจบ
                      const onEnded = () => {
                        audio.removeEventListener("ended", onEnded);
                        playNext();
                      };
                      audio.addEventListener("ended", onEnded);
                    }
                  }
                  return current;
                });
              };

              // เริ่มลูปหลังจากเสียงแรกจบ
              const startLoop = () => {
                audio.removeEventListener("ended", startLoop);
                setTimeout(loopSound, 500); // รอครึ่งวินาทีแล้วเริ่มลูป
              };
              audio.addEventListener("ended", startLoop);
            }
          }
        } else {
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
          setTimeout(() => {
            audio!.removeEventListener("canplaythrough", onCanPlay);
          }, 2000);
        }
      } catch (error: unknown) {
        console.warn(`⚠️ ${soundName} sound failed to play:`, error);
        if (error instanceof Error && error.name === "NotAllowedError") {
          toast.info(`เปิดเสียงแจ้งเตือน ${soundName}`, {
            description: "กรุณาคลิกที่หน้าจอเพื่อเปิดใช้งานเสียง",
            duration: 3000,
            action: {
              label: "เปิดเสียง",
              onClick: () => {
                [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
                  (audioRef) => {
                    if (audioRef.current) {
                      audioRef.current
                        .play()
                        .then(() => {
                          audioRef.current!.pause();
                          audioRef.current!.currentTime = 0;
                        })
                        .catch(() => {});
                    }
                  }
                );
              },
            },
          });
        }
      }
    },
    []
  );
  // เพิ่ม useEffect สำหรับ cleanup เสียงใน OrdersDashboard
  useEffect(() => {
    return () => {
      // หยุดเสียงทั้งหมดและล้าง timeout เมื่อออกจากหน้า
      setSoundPlayingTables(new Set());

      [newOrderAudioRef, checkoutAudioRef, staffCallSoundRef].forEach(
        (audioRef) => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      );

      // ล้าง timeout ทั้งหมด
      staffCallTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      setStaffCallTimeouts(new Map());
    };
  }, []);

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

  const handleCallStaffForBill = useCallback(
    (data: CallStaffForBillEvent) => {
      // เล่นเสียงพร้อมระบุ tableId
      playSound("staffCall", data.tableId);

      setStaffCallRequests((prev) => new Map(prev.set(data.tableId, data)));

      // สร้าง timeout สำหรับหยุดเสียงเท่านั้น (30 วินาที) - ไม่ลบ request
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Sound timeout for table ${data.tableId}`);

        stopStaffCallSound(data.tableId);

        setStaffCallTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.tableId);
          return newMap;
        });
      }, 30000);

      // เก็บ timeout ไว้
      setStaffCallTimeouts(
        (prev) => new Map(prev.set(data.tableId, timeoutId))
      );
    },
    [playSound, stopStaffCallSound, socket, isConnected, staffCallTimeouts]
  );

  const handleStaffCalled = useCallback((data: StaffCalledEvent) => {
    console.log("✅ Staff called confirmation received:", data);

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

      console.log("Table checked out:", data);
      toast.info(`${data.tableName || `โต๊ะ ${data.number}`} เช็คเอาท์แล้ว`, {
        description: `ยอดรวม ฿${data.totalAmount.toLocaleString()}`,
        duration: 5000,
      });

      playSound("checkout");

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

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("joinDashboard");

    socket.off("newOrder");
    socket.off("orderStatusChanged");
    socket.off("tableStatusChanged");
    socket.off("billCreated");
    socket.off("tableCheckedOut");
    socket.off("callStaffForBill");
    socket.off("staffCalled");

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

  useEffect(() => {
    fetchData(false);
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
        fetchData(true);
      }
    },
    [socket, isConnected, fetchData]
  );

  const handleAddMenuItem = (item: Omit<MenuItem, "id">) => {
    void (async () => {
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
        setMenuItems((prev) => [...prev, createdItem]);
        toast.success("เพิ่มเมนูสำเร็จ");
      } catch (error) {
        console.error("Error adding menu item:", error);
        toast.error("ไม่สามารถเพิ่มเมนูได้");
      }
    })();
  };

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            ></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              กำลังโหลดระบบ POS
            </h2>
            <p className="text-gray-600">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    ระบบจุดขาย (POS)
                  </h1>
                  <p className="text-sm text-gray-500">
                    Professional Point of Sale System
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                  <Calendar className="w-3.5 h-3.5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {new Date().toLocaleDateString("th-TH")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-700">
                    {lastRefresh.toLocaleTimeString("th-TH")}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isConnected
                      ? "bg-green-50 text-green-700 shadow-green-100 shadow-sm"
                      : "bg-red-50 text-red-700 shadow-red-100 shadow-sm"
                  }`}
                >
                  {isConnected ? (
                    <Wifi className="w-3.5 h-3.5" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5" />
                  )}
                  <span className="font-medium">
                    {isConnected ? "เชื่อมต่อแล้ว" : "ไม่เชื่อมต่อ"}
                  </span>
                  {isConnected && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {isRefreshing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-medium">กำลังซิงค์...</span>
                  </div>
                )}

                {staffCallRequests.size > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full animate-pulse">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {staffCallRequests.size} โต๊ะรอเช็คบิล
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
                  autoRefresh
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200 hover:shadow-green-300 hover:from-green-600 hover:to-green-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <Zap
                  className={`w-4 h-4 ${
                    autoRefresh ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className="text-sm">
                  Auto-refresh {autoRefresh ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={() => fetchData(false)}
                disabled={isRefreshing || !!fetchDataRef.current}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    isRefreshing || fetchDataRef.current ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm">รีเฟรช</span>
              </button>

              {todayStats.newOrders > 0 && (
                <div className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium animate-pulse shadow-sm shadow-red-200">
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {todayStats.newOrders} ออเดอร์ใหม่
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Enhanced Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-red-800 font-medium">เกิดข้อผิดพลาด</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* Enhanced Staff Call Requests */}

        {staffCallRequests.size > 0 && (
          <div className="bg-gradient-to-br from-red-50 via-red-50 to-pink-50 border-2 border-red-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-xs font-bold text-red-800">
                        {staffCallRequests.size}
                      </span>
                    </div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg sm:text-xl font-bold">
                      โต๊ะที่เรียกพนักงานเช็คบิล
                    </h3>
                    <p className="text-sm text-red-100 opacity-90">
                      {staffCallRequests.size} โต๊ะรอการตอบสนอง -
                      การแจ้งเตือนจะอยู่จนกว่าจะตอบรับ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium text-white">
                      รอดำเนินการ
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      Array.from(staffCallRequests.keys()).forEach(
                        (tableId) => {
                          setStaffCallRequests((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(tableId);
                            return newMap;
                          });
                        }
                      );
                      stopStaffCallSound(); // หยุดเสียงทั้งหมด
                      toast.success("ปิดการแจ้งเตือนทั้งหมดแล้ว");
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                    aria-label="ปิดการแจ้งเตือนทั้งหมด"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {Array.from(staffCallRequests.values()).map((request) => (
                  <div
                    key={request.tableId}
                    className={`group bg-white border-2 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      soundPlayingTables.has(request.tableId)
                        ? "border-red-300 ring-2 ring-red-200 animate-pulse bg-red-50"
                        : "border-red-100 hover:border-red-200"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 ${
                        soundPlayingTables.has(request.tableId)
                          ? "bg-gradient-to-r from-red-600 to-red-700"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-white">
                          {request.tableName}
                        </h4>
                        <div className="flex items-center gap-2">
                          {soundPlayingTables.has(request.tableId) ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                              <span className="text-xs text-yellow-200 font-bold">
                                เล่นเสียง
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              <span className="text-xs text-orange-200 font-medium">
                                รอตอบรับ
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-red-100 bg-white/20 px-2 py-1 rounded-full">
                            {new Date(request.timestamp).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {request.orderCount}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            ออเดอร์
                          </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-xl">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            ฿{request.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-red-600 font-medium">
                            ยอดรวม
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // หยุดเสียงสำหรับโต๊ะนี้
                            stopStaffCallSound(request.tableId);

                            // ยกเลิก timeout
                            const timeoutId = staffCallTimeouts.get(
                              request.tableId
                            );
                            if (timeoutId) {
                              clearTimeout(timeoutId);
                              setStaffCallTimeouts((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(request.tableId);
                                return newMap;
                              });
                            }

                            if (socket && isConnected) {
                              socket.emit("staffResponseFromDashboard", {
                                tableId: request.tableId,
                                message:
                                  "พนักงานได้รับแจ้งแล้ว กำลังเตรียมไปที่โต๊ะ",
                                timestamp: new Date().toISOString(),
                                staffConfirmed: true,
                              });
                            }

                            setStaffCallRequests((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(request.tableId);
                              return newMap;
                            });

                            toast.success(`กำลังไปที่ ${request.tableName}`);
                          }}
                          className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                            soundPlayingTables.has(request.tableId)
                              ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white animate-pulse ring-2 ring-red-300"
                              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          }`}
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">ตอบรับ & ไปที่โต๊ะ</span>
                          {soundPlayingTables.has(request.tableId) && (
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            // หยุดเสียงเฉพาะโต๊ะนี้
                            stopStaffCallSound(request.tableId);

                            // ยกเลิก timeout
                            const timeoutId = staffCallTimeouts.get(
                              request.tableId
                            );
                            if (timeoutId) {
                              clearTimeout(timeoutId);
                              setStaffCallTimeouts((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(request.tableId);
                                return newMap;
                              });
                            }

                            // ลบ request
                            setStaffCallRequests((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(request.tableId);
                              return newMap;
                            });

                            toast.info(`ปิดการแจ้งเตือน ${request.tableName}`);
                          }}
                          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                          aria-label="ปิดการแจ้งเตือน"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Quick Checkout Section */}
        {tablesWithPendingOrders.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-800">
                        {tablesWithPendingOrders.length}
                      </span>
                    </div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg sm:text-xl font-bold">
                      โต๊ะที่พร้อมเช็คบิล
                    </h3>
                    <p className="text-sm text-green-100 opacity-90">
                      {tablesWithPendingOrders.length}{" "}
                      โต๊ะพร้อมดำเนินการชำระเงิน
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    พร้อมเช็คบิล
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {tablesWithPendingOrders.map((table) => {
                  const unbilledOrders = orders.filter(
                    (order) =>
                      order.tableId === table.id &&
                      order.status !== "cancelled" &&
                      !billedOrderIds.has(order.id)
                  );
                  const totalAmount = unbilledOrders.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                  );

                  return (
                    <div
                      key={table.id}
                      className="group bg-white border-2 border-green-100 hover:border-green-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {table.number}
                              </span>
                            </div>
                            <h4 className="font-bold text-white">
                              โต๊ะ {table.number}
                            </h4>
                          </div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <div className="text-xl font-bold text-gray-800 mb-1">
                              {unbilledOrders.length}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              ออเดอร์
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-xl">
                            <div className="text-xl font-bold text-green-600 mb-1">
                              ฿{totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              ยอดรวม
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 font-medium">
                            รายละเอียดออเดอร์:
                          </div>
                          <div className="max-h-16 overflow-y-auto">
                            {unbilledOrders.slice(0, 3).map((order) => (
                              <div
                                key={order.id}
                                className="text-xs text-gray-600 flex items-center justify-between py-1"
                              >
                                <span className="truncate">
                                  ออเดอร์ #{order.id.slice(-6)}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  ฿{order.totalAmount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {unbilledOrders.length > 3 && (
                              <div className="text-xs text-gray-400 text-center py-1">
                                และอีก {unbilledOrders.length - 3} ออเดอร์
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2">
                          <CheckoutButton
                            table={table}
                            orders={orders}
                            onCheckoutComplete={handleCheckoutComplete}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 opacity-90" />
              <ArrowUp className="w-4 h-4 opacity-75" />
            </div>
            <div className="text-2xl font-bold mb-1">
              ฿{todayStats.todayRevenue.toLocaleString()}
            </div>
            <div className="text-xs opacity-90 font-medium">ยอดขายวันนี้</div>
          </div>

          <div
            className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
              todayStats.newOrders > 0
                ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 opacity-90" />
              {todayStats.newOrders > 0 && (
                <Bell className="w-4 h-4 opacity-75 animate-bounce" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {todayStats.newOrders}
            </div>
            <div className="text-xs opacity-90 font-medium">ออเดอร์ใหม่</div>
          </div>

          <div
            className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
              todayStats.preparingOrders > 0
                ? "bg-gradient-to-br from-orange-500 to-orange-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Menu className="w-6 h-6 opacity-90" />
              {todayStats.preparingOrders > 0 && (
                <Timer className="w-4 h-4 opacity-75" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {todayStats.preparingOrders}
            </div>
            <div className="text-xs opacity-90 font-medium">กำลังทำ</div>
          </div>

          <div
            className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
              todayStats.readyOrders > 0
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 opacity-90" />
              {todayStats.readyOrders > 0 && (
                <Zap className="w-4 h-4 opacity-75" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {todayStats.readyOrders}
            </div>
            <div className="text-xs opacity-90 font-medium">พร้อมเสิร์ฟ</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <ShoppingCart className="w-6 h-6 opacity-90 mb-2" />
            <div className="text-2xl font-bold mb-1">
              {todayStats.totalOrders}
            </div>
            <div className="text-xs opacity-90 font-medium">ออเดอร์วันนี้</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <TableIcon className="w-6 h-6 opacity-90 mb-2" />
            <div className="text-2xl font-bold mb-1">
              {tableStats.availableTables}
            </div>
            <div className="text-xs opacity-90 font-medium">โต๊ะว่าง</div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <Users className="w-6 h-6 opacity-90 mb-2" />
            <div className="text-2xl font-bold mb-1">
              {tableStats.occupiedTables}
            </div>
            <div className="text-xs opacity-90 font-medium">โต๊ะมีลูกค้า</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <Clock className="w-6 h-6 opacity-90 mb-2" />
            <div className="text-2xl font-bold mb-1">
              {getAverageWaitTime()}
            </div>
            <div className="text-xs opacity-90 font-medium">นาทีเฉลี่ย</div>
          </div>
        </div>
        {/* Enhanced Quick Actions */}
        {(todayStats.newOrders > 0 ||
          todayStats.preparingOrders > 0 ||
          staffCallRequests.size > 0) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-orange-800">
                การดำเนินการด่วน
              </h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {todayStats.newOrders > 0 && (
                <div className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-medium border border-red-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {todayStats.newOrders} ออเดอร์รอการยืนยัน
                </div>
              )}
              {todayStats.preparingOrders > 0 && (
                <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl text-sm font-medium border border-orange-200 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  {todayStats.preparingOrders} ออเดอร์อยู่ในครัว
                </div>
              )}
              {todayStats.readyOrders > 0 && (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium border border-blue-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {todayStats.readyOrders} ออเดอร์พร้อมเสิร์ฟ
                </div>
              )}
              {staffCallRequests.size > 0 && (
                <div className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-medium border border-red-200 animate-pulse flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {staffCallRequests.size} โต๊ะเรียกพนักงาน
                </div>
              )}
            </div>
          </div>
        )}
        {/* Enhanced Tabs Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <Tabs defaultValue="today-orders" className="w-full">
            <div className="border-b border-gray-100 bg-gray-50/50 p-4">
              <ScrollArea className="w-full">
                <TabsList className="flex gap-2 bg-transparent">
                  <TabsTrigger
                    value="today-orders"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">ออเดอร์วันนี้</span>
                    {todayStats.totalOrders > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-full text-xs font-bold">
                        {todayStats.totalOrders}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="all-orders"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:border-green-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-medium">ออเดอร์ทั้งหมด</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="tables"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="font-medium">จัดการโต๊ะ</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="menu"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="font-medium">จัดการเมนู</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="bills"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:border-red-500 data-[state=active]:shadow-lg transition-all duration-200 hover:shadow-md"
                  >
                    <Receipt className="w-4 h-4" />
                    <span className="font-medium">บิล/รายได้</span>
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="today-orders" className="mt-0">
                <OrdersOverview
                  orders={todayOrders}
                  onOrderStatusChange={handleOrderStatusChange}
                  title="ออเดอร์วันนี้"
                  showTimeAgo={true}
                />
              </TabsContent>

              <TabsContent value="all-orders" className="mt-0">
                <OrdersOverview
                  orders={orders}
                  onOrderStatusChange={handleOrderStatusChange}
                  title="ออเดอร์ทั้งหมด"
                  showTimeAgo={false}
                />
              </TabsContent>

              <TabsContent value="tables" className="mt-0">
                <TableManagement />
              </TabsContent>

              <TabsContent value="menu" className="mt-0">
                <MenuManagement
                  menuItems={menuItems}
                  onAddMenuItem={handleAddMenuItem}
                  onEditMenuItem={handleEditMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                />
              </TabsContent>

              <TabsContent value="bills" className="mt-0">
                <BillOverview />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;
