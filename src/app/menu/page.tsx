// D:\project\pos-shabu\app\menu\page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, CheckCircle } from "lucide-react";
import { useSocketContext } from "../providers/SocketProvider";

// Define your interfaces
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
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

// Separate component for client-side logic
function MenuContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
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
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data: MenuItem[] = await res.json();
        setMenuItems(data.filter((item) => item.available));
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      }
    };
    fetchMenu();
  }, [tableValid]);

  // ดึงออเดอร์ปัจจุบัน - ใช้ useCallback เพื่อป้องกัน infinite re-render
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
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "served":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (tableValid === false) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ไม่พบโต๊ะ กรุณาสแกน QR Code ใหม่
          </h1>
        </div>
      </div>
    );
  }

  if (tableValid === null) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>กำลังตรวจสอบโต๊ะ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800">เมนูร้านชาบู</h1>
          <p className="text-gray-600">
            โต๊ะ: <span className="font-semibold">{tableId}</span>
            {socket && isConnected ? (
              <span className="ml-2 text-green-600 text-sm">
                🟢 เชื่อมต่อแล้ว
              </span>
            ) : (
              <span className="ml-2 text-red-600 text-sm">
                🔴 กำลังเชื่อมต่อ...
              </span>
            )}
          </p>
        </div>

        {/* Success Message */}
        {submittedOrder && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800">
                สั่งอาหารเรียบร้อยแล้ว!
              </h3>
              <p className="text-green-600">ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว</p>
            </div>
          </div>
        )}

        {/* Current Orders Status */}
        {myOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              สถานะออเดอร์ของคุณ ({myOrders.length} ออเดอร์)
            </h2>
            <div className="space-y-4">
              {myOrders.map((order, orderIndex) => (
                <Card key={order.id} className="p-4 bg-gray-50 border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">
                      ออเดอร์ #{orderIndex + 1}
                    </h3>
                    <Badge
                      className={`text-sm ${getStatusColor(
                        orderStatuses[order.id] || order.status
                      )}`}
                    >
                      {getStatusText(orderStatuses[order.id] || order.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex justify-between items-center text-gray-600"
                      >
                        <p className="flex-1 truncate">{item.menuItem.name}</p>
                        <p>x{item.quantity}</p>
                        <p className="ml-4 font-medium text-right min-w-[50px]">
                          ฿
                          {(
                            item.menuItem.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => openItemModal(item)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    ฿{item.price.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Item Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                {selectedItem.description}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                ฿{selectedItem.price.toLocaleString()}
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">จำนวน</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">ราคารวม:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ฿{(selectedItem.price * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button onClick={addToCart} className="flex-1">
                    เพิ่มลงตะกร้า
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              ตะกร้าของคุณ ({cart.length} รายการ)
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.menuItem.name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="w-20 text-right">
                      ฿{item.subtotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">รวมทั้งหมด:</span>
              <span className="text-xl font-bold text-blue-600">
                ฿{getTotalAmount().toLocaleString()}
              </span>
            </div>

            <Button
              onClick={submitOrder}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันการสั่งอาหาร"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component using Suspense
export default function SimplifiedMenuPage() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <MenuContent />
    </Suspense>
  );
}
