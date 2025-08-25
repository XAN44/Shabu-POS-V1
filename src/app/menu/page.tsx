// app/menu/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import { useSocketContext } from "../providers/SocketProvider";
import Image from "next/image";

// Define your interfaces
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  imageKey?: string;
}

interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [tableValid, setTableValid] = useState<boolean | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>(
    {}
  );

  const { socket, isConnected } = useSocketContext();

  // ตรวจสอบ tableId
  useEffect(() => {
    if (!tableId) {
      setTableValid(false);
      return;
    }

    const checkTable = async () => {
      try {
        const res = await fetch(`/api/tables/${tableId}`);
        setTableValid(res.ok);
      } catch (err) {
        console.error("Failed to verify table:", err);
        setTableValid(false);
      }
    };
    checkTable();
  }, [tableId]);

  // โหลดเมนู
  useEffect(() => {
    if (!tableValid) return;

    const fetchMenu = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data: MenuItem[] = await res.json();
        setMenuItems(data.filter((item) => item.available));
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchMenu();
  }, [tableValid]);

  // ดึงออเดอร์ปัจจุบัน
  const fetchOrders = useCallback(async () => {
    if (!tableId) return;
    try {
      const res = await fetch(`/api/orders/${tableId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setMyOrders([]);
          setOrderStatuses({});
          return;
        }
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyOrders(data);
        const newOrderStatuses: Record<string, string> = {};
        data.forEach((order) => {
          newOrderStatuses[order.id] = order.status;
        });
        setOrderStatuses(newOrderStatuses);
      } else if (data.message) {
        setMyOrders([]);
        setOrderStatuses({});
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMyOrders([]);
      setOrderStatuses({});
    }
  }, [tableId]);

  useEffect(() => {
    if (tableId && tableValid) {
      fetchOrders();
    }
  }, [tableId, tableValid, fetchOrders]);

  // Socket.IO สำหรับ realtime order status
  useEffect(() => {
    if (!socket || !isConnected || !tableId) return;

    // Join table room และ dashboard room
    socket.emit("joinTable", tableId);
    socket.emit("joinTable", "dashboard");

    const handleNewOrder = (data: {
      orderId: string;
      tableId: string;
      totalAmount: number;
      itemsCount: number;
      customerName?: string;
      timestamp: Date;
    }) => {
      if (data.tableId === tableId) {
        fetchOrders();
      }
    };

    const handleOrderStatusChanged = (data: {
      orderId: string;
      status: string;
      tableId: string;
      timestamp: Date;
    }) => {
      if (data.tableId === tableId) {
        setOrderStatuses((prev) => ({ ...prev, [data.orderId]: data.status }));
        setMyOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
        if (data.status === "served") {
          setTimeout(() => fetchOrders(), 1000);
        }
      }
    };

    const handleOrderStatusUpdated = (data: {
      orderId: string;
      status: string;
      timestamp: Date;
    }) => {
      setOrderStatuses((prev) => ({ ...prev, [data.orderId]: data.status }));
      setMyOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
      if (data.status === "served") {
        setTimeout(() => fetchOrders(), 1000);
      }
    };

    const handleTableOrdersUpdate = (data: {
      tableId: string;
      message: string;
    }) => {
      if (data.tableId === tableId) fetchOrders();
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
  }, [socket, isConnected, tableId, fetchOrders]);

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedItem) return;
    const subtotal = selectedItem.price * quantity;
    const cartItem: CartItem = {
      menuItemId: selectedItem.id,
      quantity,
      menuItem: selectedItem,
      subtotal,
    };
    setCart((prev) => [...prev, cartItem]);
    setSelectedItem(null);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.menuItem.price * newQuantity,
            }
          : item
      )
    );
  };

  const getTotalAmount = () =>
    cart.reduce((sum, item) => sum + item.subtotal, 0);

  const submitOrder = async () => {
    if (!tableId || cart.length === 0) return;

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items: orderItems }),
      });
      if (!res.ok) throw new Error("Failed to submit order");
      const newOrder = await res.json();

      setMyOrders((prev) => [...prev, newOrder]);
      setOrderStatuses((prev) => ({ ...prev, [newOrder.id]: newOrder.status }));
      setCart([]);
      setSubmittedOrder(true);
      setTimeout(() => setSubmittedOrder(false), 3000);
      setTimeout(() => fetchOrders(), 1000);
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("เกิดข้อผิดพลาดในการสั่งอาหาร");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "กำลังเตรียม";
      case "preparing":
        return "กำลังทำ";
      case "ready":
        return "พร้อมเสิร์ฟ";
      case "served":
        return "เสิร์ฟแล้ว";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "served":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  // Filter items by category
  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (tableValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center border-l-4 border-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบโต๊ะ</h1>
            <p className="text-gray-600 mb-6">กรุณาสแกน QR Code ใหม่อีกครั้ง</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (tableValid === null || fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {tableValid === null ? "กำลังตรวจสอบโต๊ะ..." : "กำลังโหลดเมนู..."}
          </h2>
          <p className="text-gray-500">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🍲 เมนู</h1>
              <div className="text-gray-600 flex items-center gap-2">
                {socket && isConnected ? (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="text-orange-600 text-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    กำลังเชื่อมต่อ...
                  </span>
                )}
              </div>
            </div>
            {cart.length > 0 && (
              <div className="bg-red-500 text-white p-3 rounded-full">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -mt-2 -mr-2 bg-yellow-400 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cart.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {submittedOrder && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 flex items-center shadow-lg">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                สั่งอาหารสำเร็จ! 🎉
              </h3>
              <p className="opacity-90">
                ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว กรุณารอสักครู่
              </p>
            </div>
          </div>
        )}

        {/* Current Orders Status */}
        {myOrders.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
              </div>
              สถานะออเดอร์ของคุณ
              <span className="ml-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {myOrders.length} ออเดอร์
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {myOrders.map((order, orderIndex) => (
                <Card
                  key={order.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                          {orderIndex + 1}
                        </span>
                        ออเดอร์ #{orderIndex + 1}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          orderStatuses[order.id] || order.status
                        )} px-3 py-1 font-medium border`}
                      >
                        {getStatusText(orderStatuses[order.id] || order.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex justify-between items-center text-sm bg-white/50 rounded-lg p-2"
                        >
                          <p className="flex-1 font-medium text-gray-700">
                            {item.menuItem.name}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                              ×{item.quantity}
                            </span>
                            <span className="font-semibold text-gray-800 min-w-[60px] text-right">
                              ฿
                              {(
                                item.menuItem.price * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full transition-all ${
                  selectedCategory === category
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg transform scale-105"
                    : "bg-white/80 hover:bg-orange-50 text-gray-700 border-gray-200"
                }`}
              >
                {category === "all" ? "ทั้งหมด" : category}
                {category !== "all" && (
                  <span className="ml-1 text-xs opacity-75">
                    (
                    {
                      menuItems.filter((item) => item.category === category)
                        .length
                    }
                    )
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden hover:scale-105 transform"
              onClick={() => openItemModal(item)}
            >
              <div className="relative">
                {item.image ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-colors duration-300">
                    <ImageIcon className="w-16 h-16 text-orange-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-gray-700 border-0 shadow-md"
                  >
                    {item.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </CardTitle>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-2xl font-bold text-orange-600">
                      ฿{item.price.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        openItemModal(item);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              ไม่พบเมนูในหมวดหมู่นี้
            </h3>
            <p className="text-gray-500">ลองเลือกหมวดหมู่อื่นดูครับ</p>
          </div>
        )}

        {/* Item Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Image Section */}
              {selectedItem.image ? (
                <div className="relative w-full h-64">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-64 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <ImageIcon className="w-20 h-20 text-orange-300" />
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Content Section */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedItem.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-300"
                    >
                      {selectedItem.category}
                    </Badge>
                  </div>
                  {selectedItem.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-orange-600 text-center">
                    ฿{selectedItem.price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    จำนวน
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full border-2 border-orange-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <Minus className="w-5 h-5 text-orange-600" />
                    </button>
                    <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-full border-2 border-orange-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-orange-600" />
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      ราคารวม:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ฿{(selectedItem.price * quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 rounded-xl border-gray-300"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={addToCart}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <h2 className="text-lg font-semibold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                ตะกร้าของคุณ
                <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                  {cart.length} รายการ
                </span>
              </h2>
            </div>

            <div className="p-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ฿{item.menuItem.price.toLocaleString()} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                        <button
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <span className="w-20 text-right font-bold text-orange-600">
                        ฿{item.subtotal.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-gray-800">
                    รวมทั้งหมด:
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    ฿{getTotalAmount().toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={submitOrder}
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังส่งคำสั่งซื้อ...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      ยืนยันการสั่งอาหาร
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component using Suspense
export default function SimplifiedMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              กำลังโหลด...
            </h2>
            <p className="text-gray-500">โปรดรอสักครู่</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
