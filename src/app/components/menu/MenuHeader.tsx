import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  ClipboardList,
} from "lucide-react";

interface MenuHeaderProps {
  numberTable: string;
  hasServedOrders: boolean;
  servedOrdersCount: number;
  totalOrdersCount: number;
  cartLength: number;
  isConnected: boolean;
  onShowBill: () => void;
  onQuickCheckout: () => void;
  onPreviewBill: () => void;
  onShowOrderStatus: () => void;
  isCheckingOut: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  numberTable,
  hasServedOrders,
  servedOrdersCount,
  totalOrdersCount,
  cartLength,
  isConnected,
  onShowBill,
  onQuickCheckout,
  onPreviewBill,
  onShowOrderStatus,
  isCheckingOut,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white rounded-3xl shadow-2xl border border-gray-800 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side - Table Info */}
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl mr-4 shadow-lg">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {numberTable}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300 text-sm">
                  {isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
                </span>
              </div>

              {/* Order Status Indicator */}
              {totalOrdersCount > 0 && (
                <div className="flex items-center gap-1">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">
                    {totalOrdersCount} ออเดอร์
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Order Status Button - Show only when there are orders */}
          {totalOrdersCount > 0 && (
            <Button
              onClick={onShowOrderStatus}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg border-0 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              <span>เช็คสถานะ</span>
              <Badge className="ml-2 bg-white/20 text-white border-0 px-2 py-1">
                {totalOrdersCount}
              </Badge>
            </Button>
          )}

          {/* Cart Preview Button - Show only when cart has items */}
          {cartLength > 0 && (
            <Button
              onClick={onPreviewBill}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg border-0 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Eye className="w-5 h-5 mr-2" />
              <span>ดูตะกร้า</span>
              <Badge className="ml-2 bg-white/20 text-white border-0 px-2 py-1">
                {cartLength}
              </Badge>
            </Button>
          )}

          {/* Quick Checkout Button - Show only when there are served orders */}
          {hasServedOrders && (
            <Button
              onClick={onQuickCheckout}
              disabled={isCheckingOut}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg border-0 transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isCheckingOut ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>เรียกเก็บเงิน</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Additional Info Row */}
      {(totalOrdersCount > 0 || cartLength > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            {totalOrdersCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>ออเดอร์ทั้งหมด: {totalOrdersCount} รายการ</span>
              </div>
            )}

            {cartLength > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>ในตะกร้า: {cartLength} รายการ</span>
              </div>
            )}

            {hasServedOrders && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>พร้อมเรียกเก็บเงิน: {servedOrdersCount} ออเดอร์</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
