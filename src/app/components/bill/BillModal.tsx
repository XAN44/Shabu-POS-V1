"use client";
// components/bill/BillModal.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  X,
  Clock,
  CheckCircle,
  Calendar,
  Hash,
  Printer,
  MapPin,
} from "lucide-react";
import { BillSummary, Order } from "../../types/menu";

interface BillModalProps {
  isOpen: boolean;
  billSummary: BillSummary | null;
  tableId: string | null;
  tableName: string;
  onClose: () => void;
}

interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  billSummary,
  tableName,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen || !billSummary) return null;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-title"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-4 sm:p-6 md:p-8 relative overflow-hidden print:bg-white print:text-gray-900 print:border-b-2 print:border-gray-300">
          <div className="absolute inset-0 opacity-20 print:hidden">
            <div className="absolute -top-8 -right-8 sm:-top-16 sm:-right-16 w-20 h-20 sm:w-40 sm:h-40 bg-white rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 sm:-bottom-16 sm:-left-16 w-16 h-16 sm:w-32 sm:h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-24 sm:h-24 bg-white/30 rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white/25 p-2 sm:p-3 md:p-4 rounded-xl backdrop-blur-sm print:bg-gray-100 print:text-gray-700">
                <Receipt className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <div>
                <h2
                  id="bill-title"
                  className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 print:text-gray-900"
                >
                  ใบเสร็จรับเงิน
                </h2>
                <div className="flex flex-col lg:flex-row lg:items-center gap-1 sm:gap-2 lg:gap-6 text-green-100 print:text-gray-600 text-xs sm:text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {tableName}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-2 sm:p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm print:hidden focus:ring-4 focus:ring-green-500/20 self-start sm:self-auto"
              aria-label="ปิดบิล"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Bill Content - Scrollable */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 print:p-6">
            {/* Restaurant Info */}
            <div className="text-center bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 print:border-gray-300">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 print:text-gray-900">
                ร้านอาหารของเรา
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 print:text-gray-700">
                ขอบคุณที่ใช้บริการ • Thank you for dining with us
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600 print:border-gray-300">
                <div className="flex justify-center items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>เลขที่ใบเสร็จ: {Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-dashed border-gray-200 dark:border-gray-700 print:border-gray-400">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 print:text-gray-900">
                  รายการอาหารที่สั่ง ({billSummary.orders.length} ออเดอร์)
                </h3>
              </div>

              {billSummary.orders.map((order, orderIndex) => (
                <BillOrderCard
                  key={order.id}
                  order={order}
                  orderIndex={orderIndex}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-6 sm:pt-8 print:border-gray-400">
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 md:p-8 border-2 border-green-200 dark:border-green-800 print:border-gray-300 print:bg-gray-50">
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 print:text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  สรุปการสั่งซื้อ
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-700 print:bg-white print:border-gray-300">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 print:text-gray-600">
                        จำนวนออเดอร์
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 print:text-gray-900">
                        {billSummary.orders.length} ออเดอร์
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-700 print:bg-white print:border-gray-300">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 print:text-gray-600">
                        จำนวนรายการ
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 print:text-gray-900">
                        {billSummary.itemsCount} รายการ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-green-300 dark:border-green-700 pt-4 sm:pt-6 print:border-gray-400">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-700 print:bg-gray-50 print:border-gray-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 print:text-gray-900">
                        ยอดรวมทั้งหมด:
                      </span>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 print:text-gray-900">
                        ฿{billSummary.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thank you message */}
            <div className="text-center py-6 sm:py-8 border-t-2 border-dashed border-gray-200 dark:border-gray-700 print:border-gray-400">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-orange-200 dark:border-orange-800 print:bg-gray-50 print:border-gray-300">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 print:text-gray-900">
                    ขอบคุณที่มาใช้บริการ
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 print:text-gray-700">
                    หวังว่าจะได้ต้อนรับท่านอีกครั้ง
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 print:hidden">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 sm:h-12 md:h-14 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-700 font-bold text-sm sm:text-base md:text-lg transition-all duration-300 focus:ring-4 focus:ring-gray-500/20"
            >
              ปิดบิล
            </Button>

            <Button
              onClick={() => window.print()}
              className="flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-green-500/20"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              พิมพ์บิล
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BillOrderCardProps {
  order: Order;
  orderIndex: number;
}

const BillOrderCard: React.FC<BillOrderCardProps> = ({ order, orderIndex }) => {
  const orderDate = new Date(order.orderTime);
  const formattedTime = orderDate.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden print:shadow-none print:border-gray-300">
      {/* Order Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-600 print:bg-gray-50 print:border-gray-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 sm:gap-3 print:text-gray-900">
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold print:bg-gray-600">
              {orderIndex + 1}
            </span>
            <span className="text-sm sm:text-base md:text-lg">
              ออเดอร์ #{order.id.slice(-8)}
            </span>
          </h4>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-600 print:bg-gray-100 print:text-gray-700 print:border-gray-300">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>เวลาสั่ง: {formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {order.items.map((item: OrderItem, itemIndex: number) => (
            <div
              key={itemIndex}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-5 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-700/50 dark:to-orange-900/10 rounded-lg border border-gray-200 dark:border-gray-600 print:bg-gray-50 print:border-gray-300"
            >
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base md:text-lg mb-2 print:text-gray-900">
                  {item.menuItem.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium print:bg-gray-200 print:text-gray-800">
                    ฿{item.menuItem.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400">×</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold print:bg-gray-200 print:text-gray-800">
                    {item.quantity} รายการ
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 print:text-gray-900">
                  ฿{(item.menuItem.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {/* Order Total */}
          <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-600 print:border-gray-400">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 sm:p-5 border border-green-200 dark:border-green-700 print:bg-gray-100 print:border-gray-300">
              <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 print:text-gray-900">
                รวมออเดอร์นี้:
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 print:text-gray-900">
                ฿{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
