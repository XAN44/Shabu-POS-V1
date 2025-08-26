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
  onCheckout: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  hasServedOrders,
  servedOrdersCount,
  cartLength,
  isConnected,
  onShowBill,
  onCheckout,
  numberTable,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p> โต๊ะที่ {numberTable}</p>
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
              <Button
                onClick={onShowBill}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                ดูบิล
                <span className="ml-1 bg-green-400 text-green-800 px-2 py-1 rounded-full text-xs">
                  {servedOrdersCount}
                </span>
              </Button>
              <Button
                onClick={onCheckout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                เช็คเอาท์
              </Button>
            </>
          )}
          {cartLength > 0 && (
            <div className="relative">
              <div className="bg-red-500 text-white p-3 rounded-full">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {cartLength}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
