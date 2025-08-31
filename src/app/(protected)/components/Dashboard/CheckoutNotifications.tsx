import React from "react";
import { Receipt, CheckCircle } from "lucide-react";
import { Table, Order } from "@/src/app/types/Order";
import { CheckoutButton } from "../tables/CheckoutButton";

interface CheckoutNotificationsProps {
  tablesReadyForCheckout: Table[];
  orders: Order[];
  billedOrderIds: Set<string>;
  onCheckoutComplete: () => Promise<void>;
}

export const CheckoutNotifications: React.FC<CheckoutNotificationsProps> = ({
  tablesReadyForCheckout,
  orders,
  billedOrderIds,
  onCheckoutComplete,
}) => {
  if (tablesReadyForCheckout.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-800">
                  {tablesReadyForCheckout.length}
                </span>
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold">
                โต๊ะที่พร้อมเช็คบิล
              </h3>
              <p className="text-sm text-green-100 opacity-90">
                {tablesReadyForCheckout.length} โต๊ะพร้อมดำเนินการชำระเงิน
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">พร้อมเช็คบิล</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {tablesReadyForCheckout.map((table) => {
            const unbilledOrders = orders.filter(
              (order) =>
                order.tableId === table.id &&
                order.status !== "cancelled" &&
                !billedOrderIds.has(order.id)
            );
            const totalAmount = unbilledOrders.reduce(
              (sum, order) => sum + order.totalAmount,
              0
            );

            return (
              <div
                key={table.id}
                className="group bg-white border-2 border-green-100 hover:border-green-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {table.number}
                        </span>
                      </div>
                      <h4 className="font-bold text-white">
                        โต๊ะ {table.number}
                      </h4>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-xl font-bold text-gray-800 mb-1">
                        {unbilledOrders.length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        ออเดอร์
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-xl font-bold text-green-600 mb-1">
                        ฿{totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        ยอดรวม
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">
                      รายละเอียดออเดอร์:
                    </div>
                    <div className="max-h-16 overflow-y-auto">
                      {unbilledOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="text-xs text-gray-600 flex items-center justify-between py-1"
                        >
                          <span className="truncate">
                            ออเดอร์ #{order.id.slice(-6)}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ฿{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {unbilledOrders.length > 3 && (
                        <div className="text-xs text-gray-400 text-center py-1">
                          และอีก {unbilledOrders.length - 3} ออเดอร์
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <CheckoutButton
                      table={table}
                      orders={orders}
                      onCheckoutComplete={onCheckoutComplete}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
