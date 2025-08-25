// components/orders/OrdersOverview.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/src/app/types/Order";
import { OrderCard } from "./OrderCard";
import { ShoppingCart, Clock, AlertCircle } from "lucide-react";

interface OrdersOverviewProps {
  orders: Order[];
  onOrderStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  title: string;
  showTimeAgo?: boolean;
}

export const OrdersOverview: React.FC<OrdersOverviewProps> = ({
  orders,
  onOrderStatusChange,
  title,
  showTimeAgo = true,
}) => {
  // ฟังก์ชันตรวจสอบออเดอร์เร่งด่วน
  const isUrgentOrder = (order: Order): boolean => {
    if (order.status === "served" || order.status === "cancelled") {
      return false;
    }

    const orderTime = new Date(order.orderTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);

    // ถือว่าเร่งด่วนถ้ารอนานกว่า 30 นาที
    return diffMinutes > 30;
  };

  // เรียงออเดอร์ตามลำดับความสำคัญ
  const sortedOrders = [...orders].sort((a, b) => {
    // เรียงตามสถานะ: new -> preparing -> ready -> served
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

    // ถ้าสถานะเท่ากัน เรียงตามเวลา (เก่าที่สุดก่อน)
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ไม่มีออเดอร์</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {title}
            </div>
            <div className="text-sm font-normal text-gray-600">
              {orders.length} ออเดอร์
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">ออเดอร์ที่กำลังดำเนินการ</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              {activeOrders.length} ออเดอร์
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">ออเดอร์ที่เสร็จสิ้น</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {completedOrders.length} ออเดอร์
            </span>
          </div>

          {/* แสดงแค่ 12 ออเดอร์ล่าสุดที่เสร็จสิ้น */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedOrders.slice(0, 12).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onOrderStatusChange}
                showTimeAgo={showTimeAgo}
                isUrgent={false}
              />
            ))}
          </div>

          {completedOrders.length > 12 && (
            <div className="text-center mt-4">
              <p className="text-gray-500">
                แสดง 12 จาก {completedOrders.length} ออเดอร์ที่เสร็จสิ้น
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {ordersByStatus.new.length}
              </div>
              <div className="text-xs text-gray-600">ออเดอร์ใหม่</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {ordersByStatus.preparing.length}
              </div>
              <div className="text-xs text-gray-600">กำลังทำ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {ordersByStatus.ready.length}
              </div>
              <div className="text-xs text-gray-600">พร้อมเสิร์ฟ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {ordersByStatus.served.length}
              </div>
              <div className="text-xs text-gray-600">เสิร์ฟแล้ว</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {ordersByStatus.cancelled.length}
              </div>
              <div className="text-xs text-gray-600">ยกเลิก</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
