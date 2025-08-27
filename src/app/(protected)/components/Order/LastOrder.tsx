import { Order } from "@/src/app/types/Order";
import { Clock, Target } from "lucide-react";
import React from "react";
import { OrderCard } from "./OrderCard";

interface OrdersOverviewProps {
  orders: Order[];
  onOrderStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  title: string;
  showTimeAgo?: boolean;
}

function LastOrder({
  orders,
  onOrderStatusChange,
  title,
  showTimeAgo = true,
}: OrdersOverviewProps) {
  const isUrgentOrder = (order: Order): boolean => {
    if (order.status === "served" || order.status === "cancelled") {
      return false;
    }

    const orderTime = new Date(order.orderTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);

    return diffMinutes > 30;
  };

  // เรียงออเดอร์ตามลำดับความสำคัญ
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority = {
      new: 1,
      preparing: 2,
      ready: 3,
      served: 4,
      cancelled: 5,
    };

    const statusDiff =
      (statusPriority[a.status as keyof typeof statusPriority] || 99) -
      (statusPriority[b.status as keyof typeof statusPriority] || 99);

    if (statusDiff !== 0) return statusDiff;

    return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
  });

  // แยกออเดอร์ตามสถานะ
  const ordersByStatus = {
    new: sortedOrders.filter((o) => o.status === "new"),
    preparing: sortedOrders.filter((o) => o.status === "preparing"),
    ready: sortedOrders.filter((o) => o.status === "ready"),
    served: sortedOrders.filter((o) => o.status === "served"),
    cancelled: sortedOrders.filter((o) => o.status === "cancelled"),
  };

  const activeOrders = [
    ...ordersByStatus.new,
    ...ordersByStatus.preparing,
    ...ordersByStatus.ready,
  ];
  const completedOrders = [
    ...ordersByStatus.served,
    ...ordersByStatus.cancelled,
  ];

  // คำนวณยอดรวมของออเดอร์ที่เสิร์ฟแล้ว
  const totalRevenue = ordersByStatus.served.reduce((sum, order) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  // คำนวณเปอร์เซ็นต์ความสำเร็จ
  const completionRate =
    orders.length > 0
      ? (ordersByStatus.served.length / orders.length) * 100
      : 0;

  return (
    <div className="">
      {activeOrders.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-orange-200/50 shadow-xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Target className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-orange-800">
                  ออเดอร์ที่กำลังดำเนินการ
                </h3>
                <p className="text-sm sm:text-base text-orange-600 font-medium">
                  ออเดอร์ที่ต้องดำเนินการและติดตาม
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
              <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg text-sm sm:text-base">
                {activeOrders.length} ออเดอร์
              </div>
              {activeOrders.some(isUrgentOrder) && (
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold animate-bounce shadow-lg">
                  เร่งด่วน!
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 ">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onOrderStatusChange}
                showTimeAgo={showTimeAgo}
                isUrgent={isUrgentOrder(order)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LastOrder;
