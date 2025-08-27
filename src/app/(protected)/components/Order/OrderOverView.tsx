"use client";
// components/orders/OrdersOverview.tsx
import React from "react";
import { Order } from "@/src/app/types/Order";
import { OrderCard } from "./OrderCard";
import {
  ShoppingCart,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
  Activity,
  Sparkles,
  ArrowUp,
  Target,
  Award,
} from "lucide-react";

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

  if (orders.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl p-6 sm:p-8 md:p-12 max-w-lg w-full mx-auto text-center space-y-6">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg relative">
            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {title}
            </h3>
            <p className="text-base sm:text-lg text-gray-500 font-medium">
              ยังไม่มีออเดอร์ เริ่ม�้นการขายกันเลย
            </p>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl p-4 sm:p-6 md:p-8">
        {/* Main Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                {title}
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium">
                ระบบจัดการออเดอร์แบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-4">
            <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30">
              <div className="text-white/80 text-xs sm:text-sm font-medium">
                จำนวนออเดอร์
              </div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {orders.length}
              </div>
            </div>

            {totalRevenue > 0 && (
              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-green-300/30">
                <div className="text-green-100 text-xs sm:text-sm font-medium">
                  ยอดขายรวม
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">
                  ฿{totalRevenue.toLocaleString()}
                </div>
              </div>
            )}

            <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-purple-300/30">
              <div className="text-purple-100 text-xs sm:text-sm font-medium">
                อัตราสำเร็จ
              </div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {completionRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* New Orders */}
          <div
            className={`relative group ${
              ordersByStatus.new.length > 0 ? "animate-pulse" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    ordersByStatus.new.length > 0
                      ? "bg-gradient-to-br from-red-500 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {ordersByStatus.new.length > 0 && (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping delay-500"></div>
                  </div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {ordersByStatus.new.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                ออเดอร์ใหม่
              </div>
              {ordersByStatus.new.length > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    ordersByStatus.preparing.length > 0
                      ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Timer className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {ordersByStatus.preparing.length > 0 && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-spin border-2 border-white"></div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {ordersByStatus.preparing.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                กำลังทำ
              </div>
              {ordersByStatus.preparing.length > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    ordersByStatus.ready.length > 0
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {ordersByStatus.ready.length > 0 && (
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 animate-bounce" />
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {ordersByStatus.ready.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                พร้อมเสิร์ฟ
              </div>
              {ordersByStatus.ready.length > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Served Orders */}
          <div className="relative group col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {ordersByStatus.served.length > 0 && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {ordersByStatus.served.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                เสิร์ฟแล้ว
              </div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="relative group col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-500 to-slate-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {ordersByStatus.cancelled.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                ยกเลิก
              </div>
              {ordersByStatus.cancelled.length > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
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

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 shadow-xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-green-800">
                  ออเดอร์ที่เสร็จสิ้น
                </h3>
                <p className="text-sm sm:text-base text-green-600 font-medium">
                  ประวัติออเดอร์ที่ดำเนินการเสร็จแล้ว
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
              <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg text-sm sm:text-base">
                {completedOrders.length} ออเดอร์
              </div>
              {totalRevenue > 0 && (
                <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg text-sm sm:text-base">
                  ฿{totalRevenue.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
            <div className="mt-6 sm:mt-8 text-center">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold">
                  แสดง 12 จาก {completedOrders.length} ออเดอร์ที่เสร็จสิ้น
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Perfect Success State */}
      {activeOrders.length === 0 && completedOrders.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-green-200/50 shadow-xl p-8 sm:p-12 text-center">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl">
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 sm:mb-4">
            ออเดอร์ทั้งหมดเสร็จสิ้นแล้ว
          </h3>
          <p className="text-lg sm:text-xl text-green-700 font-medium mb-3 sm:mb-4">
            ยินดีด้วย! ไม่มีออเดอร์ที่ต้องดำเนินการในขณะนี้
          </p>
          <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
};
