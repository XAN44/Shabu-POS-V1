// components/menu/MenuHeader.tsx

import { Button } from "@/components/ui/button";
import { ShoppingCart, Receipt, CreditCard } from "lucide-react";

interface MenuHeaderProps {
  hasServedOrders: boolean;
  servedOrdersCount: number;
  cartLength: number;
  isConnected: boolean;
  numberTable: string;
  onShowBill: () => void;
  onQuickCheckout: () => void; // เพิ่มฟังก์ชันใหม่
  onPreviewBill: () => void; // แยกฟังก์ชันดูบิล
  isCheckingOut?: boolean; // สถานะการเช็คเอาท์
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-gray-700">{numberTable}</p>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🍲 เมนู</h1>
          <div className="text-gray-600 flex items-center gap-2">
            {isConnected ? (
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

        <div className="flex items-center gap-3">
          {hasServedOrders && (
            <>
              {/* ปุ่มเช็คเอาท์หลัก */}
              <Button
                onClick={onQuickCheckout}
                disabled={isCheckingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl shadow-lg flex items-center gap-2 font-medium"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังเช็คเอาท์...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    เช็คเอาท์
                    <span className="ml-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                      {servedOrdersCount} รายการ
                    </span>
                  </>
                )}
              </Button>

              {/* ปุ่มแสดงบิลแบบเต็ม (เผื่อต้องการ) */}
              <Button
                onClick={onShowBill}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                บิลเต็ม
              </Button>
            </>
          )}

          {/* แสดงตะกร้า */}
          {cartLength > 0 && (
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-full shadow-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                {cartLength}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* แสดงข้อมูลสรุปเมื่อมีออเดอร์ที่เสิร์ฟแล้ว */}
      {hasServedOrders && (
        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">
              มีออเดอร์ที่เสิร์ฟแล้ว {servedOrdersCount} รายการ
            </span>
            <span className="text-green-600 font-medium">พร้อมเช็คเอาท์</span>
          </div>
        </div>
      )}
    </div>
  );
};
