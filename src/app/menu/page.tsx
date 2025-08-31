"use client";

import { useBillManagement } from "@/src/hooks/useBillManagement";
import { useCartManagement } from "@/src/hooks/useCartManagement";
import { useDraftCart, useTableData } from "@/src/hooks/useDraftCart";
import { useMenuCategories } from "@/src/hooks/useMenuCategories";
import {
  useMenuData,
  useOrdersData,
  useTableValidation,
} from "@/src/hooks/useMenuData";
import { useMenuItemModal } from "@/src/hooks/useMenuItemModal";
import { useMenuSocketEvents } from "@/src/hooks/useMenuSocketEvents";
import { useSocketEvents } from "@/src/hooks/useSocketEvents";
import { useStaffCall } from "@/src/hooks/useStaffCall";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorScreen } from "../(protected)/components/layout/ErrorScreen";
import { LoadingScreen } from "../(protected)/components/layout/LoadingScreen";
import { filterItemsByCategory } from "../utils/menu";
import { MenuHeader } from "../components/menu/MenuHeader";
import { CheckoutConfirmationDialog } from "../components/confirmToCheckout";
import {
  StaffCallIndicator,
  SuccessIndicator,
} from "../(protected)/components/StatusIndicators";
import { BillModal } from "../components/bill/BillModal";
import { OrderStatusDialog } from "../components/OrderStatusDialog";
import { CategoryFilter } from "../components/menu/CategoryFilter";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { ItemModal } from "../components/cart/ItemModal";
import { EmptyState } from "../(protected)/components/layout/EmptyState";
import { ShoppingCartComponent } from "../components/cart/ShoppingCart";
// เพิ่ม import Order type
import { Order } from "../types/Order";

function MenuPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");

  // Order Status Dialog state
  const [showOrderStatusDialog, setShowOrderStatusDialog] = useState(false);

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
  const tableData = useTableData(tableId);
  const numberTable = tableData?.number || "";
  const tableName = numberTable ? `โต๊ะ ${numberTable}` : "ไม่ระบุ";

  // Custom hooks
  const { categories, selectedCategory, setSelectedCategory } =
    useMenuCategories();
  const {
    showBillModal,
    setShowBillModal,
    billSummary,
    showCheckoutDialog,
    checkoutData,
    prepareBillSummary,
    handleShowBill,
    handlePreviewBill,
    handleCloseCheckoutDialog,
    hasServedOrders,
    activeOrders,
    servedOrders,
  } = useBillManagement({ myOrders, orderStatuses });

  const {
    isCheckingOut,
    staffCallPending,
    handleStaffRequest,
    setIsCheckingOut,
    setStaffCallPending,
  } = useStaffCall({
    socket,
    isConnected,
    tableId,
    tableName,
    prepareBillSummary,
  });

  // Updated useMenuItemModal hook to support addons
  const {
    selectedItem,
    quantity,
    selectedAddons,
    setQuantity,
    updateSelectedAddons,
    openItemModal,
    addToCart,
    closeModal,
  } = useMenuItemModal({ cart, updateCart });

  const {
    loading,
    submittedOrder,
    removeFromCart,
    updateCartItemQuantity,
    submitOrder,
  } = useCartManagement({
    cart,
    updateCart,
    tableId,
    clearDraftCart,
    addNewOrder,
  });

  // Socket events
  useMenuSocketEvents({
    socket,
    isConnected,
    tableId,
    tableName,
    fetchOrders,
    clearDraftCart,
    setIsCheckingOut,
    setStaffCallPending,
  });

  // Table status checks
  if (tableData?.status === "reserved") {
    return (
      <ErrorScreen
        title="ขออภัย โต๊ะนี้ถูกจองแล้ว"
        description="กรุณาติดต่อพนักงานเพื่อขอใช้โต๊ะ หรือเลือกโต๊ะอื่น"
        buttonText="ลองใหม่อีกครั้ง"
        gradientFrom="from-amber-50"
        gradientVia="via-orange-50"
        gradientTo="to-red-50"
        buttonGradient="from-amber-400 to-orange-500"
        buttonHover="hover:from-amber-600 hover:to-orange-600"
      />
    );
  }

  if (tableValid === false) {
    return (
      <ErrorScreen
        title="ไม่พบโต๊ะ"
        description="กรุณาสแกน QR Code ใหม่อีกครั้ง"
        buttonText="ลองใหม่อีกครั้ง"
        gradientFrom="from-rose-50"
        gradientVia="via-red-50"
        gradientTo="to-pink-50"
        buttonGradient="from-rose-400 to-red-500"
        buttonHover="hover:from-rose-600 hover:to-red-600"
      />
    );
  }

  if (tableValid === null || fetchLoading) {
    return (
      <LoadingScreen
        title={tableValid === null ? "กำลังตรวจสอบโต๊ะ..." : "กำลังโหลดเมนู..."}
        subtitle="โปรดรอสักครู่"
      />
    );
  }

  const filteredItems = filterItemsByCategory(menuItems, selectedCategory);
  const totalOrders = activeOrders.length + servedOrders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 relative overflow-hidden">
      {/* Background */}
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
          totalOrdersCount={totalOrders}
          cartLength={cart.length}
          isConnected={isConnected}
          onShowBill={handleShowBill}
          onQuickCheckout={handleStaffRequest}
          onPreviewBill={handlePreviewBill}
          onShowOrderStatus={() => setShowOrderStatusDialog(true)}
          isCheckingOut={isCheckingOut || staffCallPending}
        />

        {/* Checkout Dialog */}
        {checkoutData && (
          <CheckoutConfirmationDialog
            isOpen={showCheckoutDialog}
            onClose={() => handleCloseCheckoutDialog(isCheckingOut)}
            onConfirm={handleStaffRequest}
            tableNumber={checkoutData.tableNumber}
            numberTable={checkoutData.tableNumber}
            orderCount={checkoutData.orderCount}
            totalAmount={checkoutData.totalAmount}
            isProcessing={isCheckingOut || staffCallPending}
          />
        )}

        {/* Status Indicators */}
        <StaffCallIndicator staffCallPending={staffCallPending} />
        <SuccessIndicator submittedOrder={submittedOrder} />

        {/*  สำหรับดูบิล */}
        {/* Bill Modal */}
        <BillModal
          tableName={tableName}
          isOpen={showBillModal}
          billSummary={billSummary}
          tableId={tableId}
          onClose={() => setShowBillModal(false)}
        />

        {/* Order Status Dialog */}
        <OrderStatusDialog
          isOpen={showOrderStatusDialog}
          onClose={() => setShowOrderStatusDialog(false)}
          activeOrders={activeOrders as Order[]}
          servedOrders={servedOrders as Order[]}
          orderStatuses={orderStatuses}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          menuItems={menuItems}
          onCategorySelect={setSelectedCategory}
        />

        {/* Menu Items - แสดง indicator สำหรับรายการที่มี addons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative">
              <MenuItemCard item={item} onItemClick={openItemModal} />
              {/* Addons Indicator */}
              {item.addons && item.addons.length > 0 && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10 border-2 border-white">
                  <span className="font-bold">
                    +{item.addons.filter((a) => a.available).length}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && <EmptyState />}

        {/* Item Modal - now supports addons */}
        <ItemModal
          item={selectedItem}
          quantity={quantity}
          selectedAddons={selectedAddons}
          onClose={closeModal}
          onQuantityChange={setQuantity}
          onSelectedAddonsChange={updateSelectedAddons}
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
      fallback={<LoadingScreen title="กำลังโหลด..." subtitle="โปรดรอสักครู่" />}
    >
      <MenuPage />
    </Suspense>
  );
}
