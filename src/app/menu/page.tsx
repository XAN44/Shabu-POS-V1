// app/menu/page.tsx - Enhanced Beautiful Design
"use client";

import { useState, useCallback, Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { MenuItem } from "../types/Order";
import { BillSummary, CartItem } from "../types/menu";
import {
  StaffCalledEvent,
  ServerToClientEvents,
  ClientToServerEvents,
  BillCreatedEvent,
} from "../types/socket"; // Import proper types
import {
  useMenuData,
  useOrdersData,
  useTableValidation,
} from "@/src/hooks/useMenuData";
import { useSocketEvents } from "@/src/hooks/useSocketEvents";
import { filterItemsByCategory, getUniqueCategories } from "../utils/menu";
import { MenuHeader } from "../components/menu/MenuHeader";
import { CategoryFilter } from "../components/menu/CategoryFilter";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { ItemModal } from "../components/cart/ItemModal";
import { ShoppingCartComponent } from "../components/cart/ShoppingCart";
import { BillModal } from "../components/bill/BillModal";
import { OrderStatusComponents } from "../components/order/orderStatus";
import { useDraftCart, useTableData } from "@/src/hooks/useDraftCart";
import { CheckoutConfirmationDialog } from "../components/confirmToCheckout";
import { Socket } from "socket.io-client";

// Type for socket event data that might come in various formats
interface SocketEventData {
  tableId: string;
  message?: string;
  staffId?: string;
  eta?: string;
  timestamp: string;
  staffConfirmed?: boolean;
  confirmed?: boolean;
  status?: "confirmed" | "declined" | "pending";
  tableName?: string;
}

type ModalMenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image: string | null;
  imageKey: string | null;
  available: boolean;
};

type Category = {
  id: string;
  name: string;
  createdAt: string;
};

// Extend window for timeout management
declare global {
  interface Window {
    staffCallTimeout?: NodeJS.Timeout;
  }
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [Categories, SetCategories] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [selectedItem, setSelectedItem] = useState<ModalMenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    totalAmount: number;
    orderCount: number;
    tableNumber: string;
    numberTable: string;
  } | null>(null);

  const [staffCallPending, setStaffCallPending] = useState(false);

  const tableValid = useTableValidation(tableId);
  const { menuItems, fetchLoading } = useMenuData(tableValid);
  const {
    myOrders,
    orderStatuses,
    fetchOrders,
    updateOrderStatus,
    addNewOrder,
  } = useOrdersData(tableId);

  const { cart, updateCart, clearDraftCart } = useDraftCart(
    tableId,
    tableValid
  );

  const { socket, isConnected } = useSocketEvents({
    tableId,
    fetchOrders,
    updateOrderStatus,
  });

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
  }, [socket, isConnected, tableId]);

  useEffect(() => {
    return () => {
      if (window.staffCallTimeout) {
        clearTimeout(window.staffCallTimeout);
        window.staffCallTimeout = undefined;
      }
    };
  }, []);

  // แก้ไข handleStaffRequest function ให้ timeout นานขึ้น
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

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (window.staffCallTimeout) {
        clearTimeout(window.staffCallTimeout);
        window.staffCallTimeout = undefined;
      }
    };
  }, []);

  // Modal handlers
  const openItemModal = (item: MenuItem) => {
    const modalItem: ModalMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description ?? null,
      image: item.image ?? null,
      imageKey: item.imageKey ?? null,
      available: item.available,
    };
    setSelectedItem(modalItem);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedItem) return;
    const subtotal = selectedItem.price * quantity;

    const menuItemForCart: MenuItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      category: selectedItem.category,
      description: selectedItem.description ?? undefined,
      image: selectedItem.image ?? undefined,
      imageKey: selectedItem.imageKey ?? undefined,
      available: selectedItem.available,
    };

    const cartItem: CartItem = {
      menuItemId: selectedItem.id,
      quantity,
      menuItem: menuItemForCart,
      subtotal,
    };

    updateCart([...cart, cartItem]);
    setSelectedItem(null);
  };

  // Cart handlers
  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = cart.map((item, i) =>
      i === index
        ? {
            ...item,
            quantity: newQuantity,
            subtotal: item.menuItem.price * newQuantity,
          }
        : item
    );
    updateCart(newCart);
  };

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

      addNewOrder(newOrder);

      await clearDraftCart();

      setSubmittedOrder(true);
      setTimeout(() => setSubmittedOrder(false), 3000);
    } catch (err) {
      console.error("Error submitting order:", err);
      toast.error("เกิดข้อผิดพลาดในการสั่งอาหาร");
    } finally {
      setLoading(false);
    }
  };

  // Bill handlers
  const prepareBillSummary = useCallback(() => {
    const servedOrders = myOrders.filter(
      (order) => (orderStatuses[order.id] || order.status) === "served"
    );

    if (servedOrders.length === 0) return null;

    const totalAmount = servedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalItemsCount = servedOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      orders: servedOrders,
      totalAmount,
      itemsCount: totalItemsCount,
    };
  }, [myOrders, orderStatuses]);

  const handleShowBill = () => {
    const summary = prepareBillSummary();
    if (summary) {
      setBillSummary(summary);
      setShowBillModal(true);
    }
  };

  const tableData = useTableData(tableId);
  const numberTable = tableData?.number || "";
  const tableName = numberTable ? `โต๊ะ ${numberTable}` : "ไม่ระบุ";

  // Enhanced staff request function with better error handling and typing

  // Function to close dialog
  const handleCloseCheckoutDialog = () => {
    if (isCheckingOut) return; // Prevent closing while processing
    setShowCheckoutDialog(false);
    setCheckoutData(null);
  };

  const handlePreviewBill = () => {
    const summary = prepareBillSummary();
    if (summary) {
      setBillSummary(summary);
      setShowBillModal(true);
    }
  };

  // Debug Panel Component (only in development)

  // Computed values
  const hasServedOrders = useMemo(() => {
    const servedCount = myOrders.filter(
      (order) => (orderStatuses[order.id] || order.status) === "served"
    ).length;

    return servedCount > 0;
  }, [myOrders, orderStatuses]);

  const activeOrders = myOrders.filter(
    (o) => (orderStatuses[o.id] || o.status) !== "served"
  );
  const servedOrders = myOrders.filter(
    (o) => (orderStatuses[o.id] || o.status) === "served"
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const categoriesData: Category[] = await response.json();
        // ✅ แปลงเป็น string[] ของ name
        SetCategories(categoriesData.map((c) => c.name));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  };

  const filteredItems = filterItemsByCategory(menuItems, selectedCategory);

  if (tableData?.status === "reserved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center border border-white/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-orange-100/20 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <X className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              ขออภัย โต๊ะนี้ถูกจองแล้ว
            </h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              กรุณาติดต่อพนักงานเพื่อขอใช้โต๊ะ หรือเลือกโต๊ะอื่น
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading and error states
  if (tableValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-red-100/20 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <X className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent mb-4">
                ไม่พบโต๊ะ
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                กรุณาสแกน QR Code ใหม่อีกครั้ง
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tableValid === null || fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto shadow-lg"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-300 rounded-full animate-spin mx-auto mt-4 ml-4"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {tableValid === null ? "กำลังตรวจสอบโต๊ะ..." : "กำลังโหลดเมนู..."}
          </h2>
          <p className="text-gray-600 text-lg">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl relative z-10">
        {/* Header */}
        <MenuHeader
          numberTable={tableName}
          hasServedOrders={hasServedOrders}
          servedOrdersCount={servedOrders.length}
          cartLength={cart.length}
          isConnected={isConnected}
          onShowBill={handleShowBill}
          onQuickCheckout={handleStaffRequest}
          onPreviewBill={handlePreviewBill}
          isCheckingOut={isCheckingOut || staffCallPending}
        />

        {checkoutData && (
          <CheckoutConfirmationDialog
            isOpen={showCheckoutDialog}
            onClose={handleCloseCheckoutDialog}
            onConfirm={handleStaffRequest}
            tableNumber={checkoutData.tableNumber}
            numberTable={checkoutData.tableNumber}
            orderCount={checkoutData.orderCount}
            totalAmount={checkoutData.totalAmount}
            isProcessing={isCheckingOut || staffCallPending}
          />
        )}

        {/* Staff Call Pending Indicator */}
        {staffCallPending && (
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-3xl p-8 flex items-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 pointer-events-none"></div>
            <div className="relative z-10 flex items-center w-full">
              <div className="bg-white/25 p-4 rounded-full mr-6 shadow-lg">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  กำลังเรียกพนักงาน...
                </h3>
                <p className="opacity-90 text-lg">
                  สัญญาณถูกส่งแล้ว กำลังรอการตอบกลับ
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submittedOrder && (
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-3xl p-8 flex items-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-teal-400/20 pointer-events-none"></div>
            <div className="relative z-10 flex items-center w-full">
              <div className="bg-white/25 p-4 rounded-full mr-6 shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">สั่งอาหารสำเร็จ!</h3>
                <p className="opacity-90 text-lg">
                  ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว กรุณารอสักครู่
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <BillModal
          tableName={tableName}
          isOpen={showBillModal}
          billSummary={billSummary}
          tableId={tableId}
          onClose={() => setShowBillModal(false)}
        />

        {/* Order Status */}
        <OrderStatusComponents
          activeOrders={activeOrders}
          servedOrders={servedOrders}
          orderStatuses={orderStatuses}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={Categories}
          selectedCategory={selectedCategory}
          menuItems={menuItems}
          onCategorySelect={setSelectedCategory}
        />

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onItemClick={openItemModal}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/30 max-w-md mx-auto">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ImageIcon className="w-14 h-14 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                ไม่พบเมนูในหมวดหมู่นี้
              </h3>
              <p className="text-gray-500 text-lg">
                ลองเลือกหมวดหมู่อื่นดูครับ
              </p>
            </div>
          </div>
        )}

        {/* Item Modal */}
        <ItemModal
          item={selectedItem}
          quantity={quantity}
          onClose={() => setSelectedItem(null)}
          onQuantityChange={setQuantity}
          onAddToCart={addToCart}
        />

        {/* Shopping Cart */}
        <ShoppingCartComponent
          cart={cart}
          loading={loading}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onSubmitOrder={submitOrder}
        />
      </div>
    </div>
  );
}

export default function SimplifiedMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto shadow-lg"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-300 rounded-full animate-spin mx-auto mt-4 ml-4"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              กำลังโหลด...
            </h2>
            <p className="text-gray-600 text-lg">โปรดรอสักครู่</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
