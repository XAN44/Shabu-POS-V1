import { Order } from "@/src/app/types/Order";
import { Clock, Target, AlertTriangle } from "lucide-react";
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

  // Sort orders by priority
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

  // Separate orders by status
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

  const urgentOrdersCount = activeOrders.filter(isUrgentOrder).length;

  if (activeOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ออเดอร์ทั้งหมดเสร็จสิ้น
          </h3>
          <p className="text-gray-500">ไม่มีออเดอร์ที่ต้องดำเนินการในขณะนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                ออเดอร์กำลังดำเนินการ
              </h3>
              <p className="text-orange-100 text-sm">
                {activeOrders.length} ออเดอร์ที่ต้องติดตาม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm font-medium">
              {activeOrders.length} ออเดอร์
            </div>
            {urgentOrdersCount > 0 && (
              <div className="px-3 py-1.5 bg-red-600 rounded-lg text-white text-sm font-medium animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                เร่งด่วน {urgentOrdersCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 bg-orange-50">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}

export default LastOrder;
