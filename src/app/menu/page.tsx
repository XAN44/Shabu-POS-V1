// app/menu/page.tsx - Fixed version with proper types
"use client";

import { useState, useCallback, Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { MenuItem } from "../types/Order";
import { BillSummary, CartItem } from "../types/menu";
import {
  StaffCalledEvent,
  StaffResponseEvent,
  ServerToClientEvents,
  ClientToServerEvents,
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
import { OrderStatus } from "@prisma/client";
import { OrderStatusComponents } from "../components/order/orderStatus";
import { useDraftCart, useTableData } from "@/src/hooks/useDraftCart";
import { CheckoutConfirmationDialog } from "../components/confirmToCheckout";
import { Socket } from "socket.io-client";

// Create a type that matches what ItemModal expects
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

// Interface for staff response data - properly typed
interface StaffResponseData {
  tableId: string;
  message: string;
  staffId?: string;
  eta?: string;
  timestamp: string;
  staffConfirmed?: boolean;
  status?: string;
}

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

  // State for staff call confirmation
  const [staffCallPending, setStaffCallPending] = useState(false);

  const tableValid = useTableValidation(tableId);
  const { menuItems, fetchLoading } = useMenuData(tableValid);
  const {
    myOrders,
    orderStatuses,
    fetchOrders,
    updateOrderStatus,
    addNewOrder,
    removeOrdersById,
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

  // Enhanced Staff response handling useEffect with proper typing
  useEffect(() => {
    if (!socket || !isConnected || !tableId) {
      console.log("Socket not ready:", {
        socket: !!socket,
        isConnected,
        tableId,
      });
      return;
    }

    console.log("Setting up staff response listeners for table:", tableId);

    // Type-safe socket instance
    const typedSocket = socket as Socket<
      ServerToClientEvents,
      ClientToServerEvents
    >;

    // Enhanced staff response handlers with proper typing
    const handleStaffCalled = (data: StaffCalledEvent) => {
      console.log("✅ [CUSTOMER] Staff called confirmation received:", data);

      if (data.tableId === tableId) {
        console.log(
          "✅ [CUSTOMER] Confirmation is for this table, clearing states"
        );

        setIsCheckingOut(false);
        setStaffCallPending(false);

        // Clear timeout if exists
        if (window.staffCallTimeout) {
          clearTimeout(window.staffCallTimeout);
          window.staffCallTimeout = undefined;
        }

        toast.success("พนักงานได้รับแจ้งแล้ว! 👨‍💼", {
          description: data.message || "พนักงานกำลังมาที่โต๊ะ",
          duration: 5000,
          className: "border-green-200 bg-green-50",
          action: {
            label: "ตกลง",
            onClick: () => {},
          },
        });
      } else {
        console.log(
          "❌ [CUSTOMER] Confirmation for different table:",
          data.tableId
        );
      }
    };

    const handleStaffResponse = (data: StaffResponseData) => {
      console.log("👥 [CUSTOMER] Staff response received:", data);

      if (data.tableId === tableId) {
        console.log("✅ [CUSTOMER] Staff response is for this table");

        setIsCheckingOut(false);
        setStaffCallPending(false);

        // Clear timeout if exists
        if (window.staffCallTimeout) {
          clearTimeout(window.staffCallTimeout);
          window.staffCallTimeout = undefined;
        }

        toast.success("พนักงานตอบรับแล้ว! ✅", {
          description: data.message || "พนักงานกำลังมาที่โต๊ะ",
          duration: 5000,
          className: "border-green-200 bg-green-50",
        });
      }
    };

    const handleStaffResponseConfirmed = (data: {
      tableId: string;
      timestamp: string;
    }) => {
      console.log("✅ [CUSTOMER] Staff response confirmed:", data);

      if (data.tableId === tableId) {
        console.log("✅ [CUSTOMER] Response confirmation is for this table");

        setIsCheckingOut(false);
        setStaffCallPending(false);

        // Clear timeout if exists
        if (window.staffCallTimeout) {
          clearTimeout(window.staffCallTimeout);
          window.staffCallTimeout = undefined;
        }

        toast.success("พนักงานตอบรับแล้ว! 🎉", {
          description: "พนักงานกำลังมาที่โต๊ะ",
          duration: 3000,
          className: "border-green-200 bg-green-50",
        });
      }
    };

    // Generic handler with proper typing
    const handleGenericStaffResponse = (data: StaffResponseData) => {
      console.log("🔄 [CUSTOMER] Generic staff response:", data);

      if (data?.tableId === tableId) {
        setIsCheckingOut(false);
        setStaffCallPending(false);

        // Clear timeout if exists
        if (window.staffCallTimeout) {
          clearTimeout(window.staffCallTimeout);
          window.staffCallTimeout = undefined;
        }

        toast.success("พนักงานตอบรับแล้ว!", {
          description: "กำลังมาที่โต๊ะ",
          duration: 3000,
          className: "border-green-200 bg-green-50",
        });
      }
    };

    // Handle table joined confirmation
    const handleTableJoined = (data: { tableId: string; timestamp: Date }) => {
      console.log("🍽️ [CUSTOMER] Table joined confirmation:", data);
    };

    // Clear any existing listeners
    const events: Array<keyof ServerToClientEvents> = [
      "staffCalled",
      "staffResponded",
      "staffResponseConfirmed",
      "staffResponseFromDashboard",
      "callStaffResponse",
      "tableJoined",
    ];

    events.forEach((event) => typedSocket.off(event));

    // Add new listeners with proper typing
    typedSocket.on("staffCalled", handleStaffCalled);
    typedSocket.on("staffResponded", handleStaffResponse);
    typedSocket.on("staffResponseConfirmed", handleStaffResponseConfirmed);
    typedSocket.on("staffResponseFromDashboard", handleGenericStaffResponse);
    typedSocket.on("callStaffResponse", handleGenericStaffResponse);
    typedSocket.on("tableJoined", handleTableJoined);

    return () => {
      console.log("🧹 [CUSTOMER] Cleaning up staff response listeners...");
      events.forEach((event) => typedSocket.off(event));

      // Clear timeout on cleanup
      if (window.staffCallTimeout) {
        clearTimeout(window.staffCallTimeout);
        window.staffCallTimeout = undefined;
      }
    };
  }, [socket, isConnected, tableId]);

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

      // Call API to send staff call signal
      const response = await fetch(`/api/tables/${tableId}/callStaff`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to call staff");
      }

      const result = await response.json();
      console.log("🔔 [CUSTOMER] API response:", result);

      if (result.success) {
        // Show first toast that signal was sent
        toast.success("ส่งสัญญาณเรียกพนักงานแล้ว! 📞", {
          description: `${tableName} - กำลังรอการตอบกลับ...`,
          duration: 5000,
        });

        // Test: emit additional socket event with proper typing
        console.log("🔔 [CUSTOMER] Emitting additional socket events");
        const typedSocket = socket as Socket<
          ServerToClientEvents,
          ClientToServerEvents
        >;
        typedSocket.emit("customerCallStaff", {
          tableId,
          tableName,
          timestamp: new Date().toISOString(),
        });

        // Set longer timeout with better fallback
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
        }, 15000); // Increased to 15 seconds
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

  const categories = getUniqueCategories(menuItems);
  const filteredItems = filterItemsByCategory(menuItems, selectedCategory);

  // Loading and error states
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
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl"
            >
              ลองใหม่อีกครั้ง
            </button>
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 flex items-center shadow-lg">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                กำลังเรียกพนักงาน...
              </h3>
              <p className="opacity-90">สัญญาณถูกส่งแล้ว กำลังรอการตอบกลับ</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submittedOrder && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 flex items-center shadow-lg">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">สั่งอาหารสำเร็จ!</h3>
              <p className="opacity-90">
                ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว กรุณารอสักครู่
              </p>
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
          categories={categories}
          selectedCategory={selectedCategory}
          menuItems={menuItems}
          onCategorySelect={setSelectedCategory}
        />

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Debug Panel */}
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
