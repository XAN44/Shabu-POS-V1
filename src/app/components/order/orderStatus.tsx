import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, CheckCircle2, Receipt, Star } from "lucide-react";
import { Order } from "../../types/menu";
import { getStatusColor, getStatusText } from "../../utils/menu";

interface OrderStatusProps {
  activeOrders: Order[];
  servedOrders: Order[];
  orderStatuses: Record<string, string>;
}

export const OrderStatusComponents: React.FC<OrderStatusProps> = ({
  activeOrders,
  servedOrders,
  orderStatuses,
}) => {
  if (activeOrders.length === 0 && servedOrders.length === 0) {
    return null;
  }

  const totalOrders = activeOrders.length + servedOrders.length;
  const totalAmount = [...activeOrders, ...servedOrders].reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  return (
    <div className="w-full">
      {/* Premium Header with Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white rounded-3xl shadow-2xl border border-gray-800 p-6 sm:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl mr-4 shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                สถานะออเดอร์ของคุณ
              </h1>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">
                ติดตามออเดอร์และสถานะการเสิร์ฟ
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {totalOrders}
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  ออเดอร์ทั้งหมด
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ฿{totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  ยอดรวมทั้งหมด
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-4 h-4 rounded-full mr-3 shadow-lg"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                กำลังดำเนินการ
              </h2>
              <Badge className="ml-3 bg-orange-100 text-orange-800 border-orange-200 px-3 py-1 font-semibold">
                {activeOrders.length} ออเดอร์
              </Badge>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {activeOrders.map((order, orderIndex) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  orderIndex={orderIndex}
                  status={orderStatuses[order.id] || order.status}
                  variant="active"
                />
              ))}
            </div>
          </div>
        )}

        {/* Served Orders Section */}
        {servedOrders.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-4 h-4 rounded-full mr-3 shadow-lg"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                เสิร์ฟแล้ว
              </h2>
              <Badge className="ml-3 bg-green-100 text-green-800 border-green-200 px-3 py-1 font-semibold">
                {servedOrders.length} ออเดอร์
              </Badge>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {servedOrders.map((order, orderIndex) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  orderIndex={orderIndex}
                  status="served"
                  variant="served"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  orderIndex: number;
  status: string;
  variant: "active" | "served";
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  orderIndex,
  status,
  variant,
}) => {
  const isActive = variant === "active";

  const cardClass = isActive
    ? "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200 hover:border-orange-300"
    : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 hover:border-green-300";

  const headerGradient = isActive
    ? "bg-gradient-to-r from-orange-500 to-red-500"
    : "bg-gradient-to-r from-green-500 to-emerald-500";

  // Calculate totals for better price breakdown
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + (item.menuItem?.price * item.quantity || 0),
    0
  );

  const addonsTotal = order.items.reduce(
    (sum, item) =>
      sum +
      (item.addons?.reduce(
        (addonSum, addon) =>
          addonSum + addon.price * addon.quantity * item.quantity,
        0
      ) || 0),
    0
  );

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAddons = order.items.reduce(
    (sum, item) =>
      sum +
      (item.addons?.reduce(
        (addonSum, addon) => addonSum + addon.quantity * item.quantity,
        0
      ) || 0),
    0
  );

  return (
    <Card
      className={`${cardClass} border-2 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1`}
    >
      <CardContent className="p-0 overflow-hidden">
        {/* Premium Header */}
        <div className={`${headerGradient} text-white p-4 sm:p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                {isActive ? (
                  <div className="flex items-center justify-center w-6 h-6">
                    <span className="text-xl font-bold">{orderIndex + 1}</span>
                  </div>
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  ออเดอร์ #{order.id.slice(-8)}
                </h3>
                <p className="text-white/80 text-sm">
                  {isActive ? "กำลังเตรียม" : "เสิร์ฟเรียบร้อย"}
                </p>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(
                status
              )} px-4 py-2 font-bold text-sm border-0 shadow-lg`}
            >
              {getStatusText(status)}
            </Badge>
          </div>
        </div>

        {/* Order Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Items Summary Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Receipt className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-800">รายการอาหาร</span>
              </div>
              <div className="text-sm text-gray-600">
                {totalItems} จาน {totalAddons > 0 && `+ ${totalAddons} เสริม`}
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  {/* Main Item */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-base leading-tight">
                        {item.menuItem?.name || "เมนูลบแล้ว"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`${
                            isActive
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-green-100 text-green-700 border-green-200"
                          } px-2 py-1 text-xs font-medium`}
                        >
                          {item.quantity} จาน
                        </Badge>
                        <span className="text-xs text-gray-500">
                          @ ฿{item.menuItem?.price?.toLocaleString()} / จาน
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-gray-800">
                        {item.menuItem
                          ? `฿${(
                              item.menuItem.price * item.quantity
                            ).toLocaleString()}`
                          : "เมนูลบแล้ว"}
                      </div>
                    </div>
                  </div>

                  {/* Addons */}
                  {item.addons && item.addons.length > 0 && (
                    <div className="pl-4 mt-3 pt-3 border-t border-blue-100">
                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-blue-700">
                          ของเสริม:
                        </span>
                      </div>
                      <div className="space-y-2">
                        {item.addons.map((addon, addonIndex) => (
                          <div
                            key={addonIndex}
                            className="flex justify-between items-center bg-blue-50/80 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-blue-700">
                              + {addon.name}
                              <span className="text-xs text-blue-600 ml-1">
                                ({addon.quantity} รายการ/จาน × {item.quantity}{" "}
                                จาน)
                              </span>
                            </span>
                            <span className="font-bold text-blue-800">
                              ฿
                              {(
                                addon.price *
                                addon.quantity *
                                item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Price Breakdown */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-gray-600" />
              สรุปค่าใช้จ่าย
            </h4>

            <div className="space-y-3">
              {/* Items Subtotal */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-medium">
                  อาหารหลัก ({totalItems} จาน)
                </span>
                <span className="font-bold text-gray-800">
                  ฿{itemsTotal.toLocaleString()}
                </span>
              </div>

              {/* Addons Subtotal */}
              {addonsTotal > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-600 font-medium">
                    ของเสริม ({totalAddons} รายการ)
                  </span>
                  <span className="font-bold text-blue-700">
                    ฿{addonsTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Divider */}
              <hr className="border-gray-300 my-3" />

              {/* Total */}
              <div className="flex justify-between items-center py-3 bg-white rounded-xl px-4 border-2 border-gray-200">
                <div>
                  <span className="text-xl font-bold text-gray-800">
                    ยอดรวมทั้งหมด
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-3xl font-extrabold ${
                      isActive ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    ฿{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div
            className={`flex items-center justify-center p-4 rounded-2xl ${
              isActive
                ? "bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200"
                : "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {isActive ? (
                <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
              <span
                className={`font-bold text-lg ${
                  isActive ? "text-orange-800" : "text-green-800"
                }`}
              >
                {isActive ? "กำลังเตรียมอาหาร..." : "เสิร์ฟเรียบร้อยแล้ว"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
