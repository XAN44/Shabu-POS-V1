import { Button } from "@/components/ui/button";
import { ShoppingCart, Receipt, CreditCard } from "lucide-react";

interface MenuHeaderProps {
  hasServedOrders: boolean;
  servedOrdersCount: number;
  cartLength: number;
  isConnected: boolean;
  numberTable: string;
  onShowBill: () => void;
  onQuickCheckout: () => void;
  onPreviewBill: () => void;
  isCheckingOut?: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  hasServedOrders,
  servedOrdersCount,
  cartLength,
  isConnected,
  onShowBill,
  onQuickCheckout,
  numberTable,
  isCheckingOut = false,
}) => {
  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        {/* Left Side - Table Info and Title */}
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-1">
            {numberTable}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
            🍲 เมนู
          </h1>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span>เชื่อมต่อแล้ว</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span>กำลังเชื่อมต่อ...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          {hasServedOrders && (
            <>
              {/* Quick Checkout Button */}
              <Button
                onClick={onQuickCheckout}
                disabled={isCheckingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 sm:px-6 py-2 rounded-xl shadow-lg font-medium transition-all duration-200 text-sm sm:text-base"
                aria-label={`เช็คเอาท์ ${servedOrdersCount} รายการ`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span className="hidden sm:inline">
                        กำลังเช็คเอาท์...
                      </span>
                      <span className="sm:hidden">กำลัง...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>เช็คเอาท์</span>
                      <span className="bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                        {servedOrdersCount}
                      </span>
                    </>
                  )}
                </div>
              </Button>

              {/* Full Bill Button */}
              <Button
                onClick={onShowBill}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm sm:text-base"
                aria-label="แสดงบิลเต็ม"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">บิลเต็ม</span>
                  <span className="sm:hidden">บิล</span>
                </div>
              </Button>
            </>
          )}

          {/* Shopping Cart */}
          {cartLength > 0 && (
            <div className="relative flex-shrink-0">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 sm:p-3 rounded-full shadow-lg">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className="absolute -top-2 -right-2 bg-yellow-400 text-orange-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-md min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px]"
                aria-label={`${cartLength} รายการในตะกร้า`}
              >
                {cartLength > 99 ? "99+" : cartLength}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Served Orders Summary */}
      {hasServedOrders && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-green-700 text-sm font-medium">
              มีออเดอร์ที่เสิร์ฟแล้ว {servedOrdersCount} รายการ
            </span>
            <span className="text-green-600 font-medium text-sm bg-green-100 px-3 py-1 rounded-full self-start sm:self-auto">
              พร้อมเช็คเอาท์
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
