import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  Trash2,
  Package,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { CartItem } from "../../types/menu";

interface ShoppingCartProps {
  cart: CartItem[];
  loading: boolean;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: () => void;
}

export const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  cart,
  loading,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (cart.length === 0) return null;

  const getTotalAmount = () =>
    cart.reduce((sum, item) => sum + item.subtotal, 0);

  const getTotalItems = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0);

  // Minimized floating cart
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 min-w-0"
          aria-label="เปิดตะกร้าสินค้า"
        >
          <ShoppingCart className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-bold truncate">
              {getTotalItems()} รายการ
            </span>
            <span className="text-xs truncate">
              ฿{getTotalAmount().toLocaleString()}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl shadow-2xl border-t-2 border-l-2 border-r-2 sm:border-2 border-orange-200/60 dark:border-orange-800/60 overflow-hidden transition-all duration-300">
          {/* Collapsible Header */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold truncate">
                      ตะกร้าของคุณ
                    </h2>
                    <p className="text-sm text-white/90 truncate">
                      {getTotalItems()} รายการ • ฿
                      {getTotalAmount().toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span className="text-base font-bold">{cart.length}</span>
                  </div>

                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                    aria-label={isCollapsed ? "ขยายตะกร้า" : "ย่อตะกร้า"}
                  >
                    {isCollapsed ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsMinimized(true)}
                    className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                    aria-label="ย่อตะกร้าเป็นปุ่มลอย"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isCollapsed && (
            <>
              {/* Cart Items */}
              <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {cart.map((item, index) => (
                    <CartItemRow
                      key={`${item.menuItem.name}-${index}`}
                      item={item}
                      index={index}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemoveItem={onRemoveItem}
                    />
                  ))}
                </div>
              </div>

              {/* Summary Section */}
              <div className="p-3 sm:p-4 border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        จำนวนรายการ:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {getTotalItems()} รายการ
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        ยอดรวมทั้งหมด:
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                        ฿{getTotalAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Button - Always Visible */}
          <div className="p-3 sm:p-4 border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80">
            <Button
              onClick={onSubmitOrder}
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 rounded-xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-orange-500/20"
              aria-label={loading ? "กำลังส่งคำสั่งซื้อ" : "ยืนยันการสั่งอาหาร"}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="truncate">กำลังส่งคำสั่งซื้อ...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">ยืนยันการสั่งอาหาร</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CartItemRowProps {
  item: CartItem;
  index: number;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  index,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const getItemTotalWithAddons = () => {
    const basePrice = item.menuItem.price * item.quantity;
    const addonsPrice = item.selectedAddons
      ? item.selectedAddons.reduce(
          (sum, addon) => sum + addon.price * addon.quantity * item.quantity,
          0
        )
      : 0;
    return basePrice + addonsPrice;
  };

  return (
    <div className="bg-gradient-to-r from-white to-orange-50/30 dark:from-gray-800 dark:to-orange-900/10 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 overflow-hidden transition-all duration-300 shadow-sm">
      <div className="p-3 sm:p-4">
        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2 mb-2">
                {item.menuItem.name}
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-medium">
                    ฿{item.menuItem.price.toLocaleString()}
                  </span>
                  <span>×</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {item.quantity}
                  </span>
                </div>

                {/* Show addons */}
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div className="space-y-1">
                    {item.selectedAddons.map((addon, addonIndex) => (
                      <div
                        key={addonIndex}
                        className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400"
                      >
                        <span>+ {addon.name}</span>
                        <span>×{addon.quantity}</span>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                          ฿{addon.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                ฿{item.subtotal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-gray-500 hover:border-orange-300 dark:hover:border-orange-600 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                aria-label={`ลดจำนวน ${item.menuItem.name}`}
              >
                <Minus className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="w-8 text-center font-bold text-gray-900 dark:text-gray-100 text-sm flex-shrink-0">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-gray-500 hover:border-orange-300 dark:hover:border-orange-600 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                aria-label={`เพิ่มจำนวน ${item.menuItem.name}`}
              >
                <Plus className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <button
              onClick={() => onRemoveItem(index)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 flex-shrink-0"
              title="ลบรายการ"
              aria-label={`ลบ ${item.menuItem.name} ออกจากตะกร้า`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight line-clamp-1">
                {item.menuItem.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-medium">
                  ฿{item.menuItem.price.toLocaleString()}
                </span>
                <span>×</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {item.quantity}
                </span>
              </div>
            </div>

            {/* Show addons in desktop layout */}
            {item.selectedAddons && item.selectedAddons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.selectedAddons.map((addon, addonIndex) => (
                  <div
                    key={addonIndex}
                    className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-700"
                  >
                    <span>+ {addon.name}</span>
                    <span className="font-semibold">×{addon.quantity}</span>
                    <span className="font-bold">฿{addon.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-gray-500 hover:border-orange-300 dark:hover:border-orange-600 flex items-center justify-center transition-all duration-200"
                aria-label={`ลดจำนวน ${item.menuItem.name}`}
              >
                <Minus className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="w-8 text-center font-bold text-gray-900 dark:text-gray-100 text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-gray-500 hover:border-orange-300 dark:hover:border-orange-600 flex items-center justify-center transition-all duration-200"
                aria-label={`เพิ่มจำนวน ${item.menuItem.name}`}
              >
                <Plus className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                ฿{item.subtotal.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => onRemoveItem(index)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="ลบรายการ"
              aria-label={`ลบ ${item.menuItem.name} ออกจากตะกร้า`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
