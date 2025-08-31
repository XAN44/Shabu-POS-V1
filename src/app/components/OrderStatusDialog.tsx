import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Receipt,
  Star,
  X,
} from "lucide-react";
// ใช้ path เดียวกับไฟล์อื่นๆ ในโปรเจค (uppercase)
import { Order, OrderItem, OrderItemAddon } from "../types/Order";
import { getStatusColor, getStatusText } from "../utils/menu";

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrders: Order[];
  servedOrders: Order[];
  orderStatuses: Record<string, string>;
}

export const OrderStatusDialog: React.FC<OrderStatusDialogProps> = ({
  isOpen,
  onClose,
  activeOrders,
  servedOrders,
  orderStatuses,
}) => {
  const totalOrders = activeOrders.length + servedOrders.length;
  const totalAmount = [...activeOrders, ...servedOrders].reduce(
    (sum: number, order: Order) => sum + order.totalAmount,
    0
  );

  // ถ้าไม่มีออเดอร์เลยก็ไม่แสดง dialog
  if (totalOrders === 0 && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              สถานะออเดอร์
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">ยังไม่มีออเดอร์</p>
            <p className="text-gray-400 text-sm mt-2">
              เมื่อสั่งอาหารแล้ว จะสามารถดูสถานะได้ที่นี่
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">สถานะออเดอร์ของคุณ</span>
                <p className="text-sm text-gray-500 font-normal">
                  ติดตามออเดอร์และสถานะการเสิร์ฟ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>

          {/* Summary Cards */}
          <div className="flex gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalOrders}
                </div>
                <div className="text-xs text-blue-500 font-medium">
                  ออเดอร์ทั้งหมด
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ฿{totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-green-500 font-medium">
                  ยอดรวมทั้งหมด
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-3 h-3 rounded-full mr-2"></div>
                <h3 className="text-lg font-bold text-gray-800">
                  กำลังดำเนินการ
                </h3>
                <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200 px-2 py-1 text-xs">
                  {activeOrders.length} ออเดอร์
                </Badge>
              </div>
              <div className="space-y-4">
                {activeOrders.map((order: Order, orderIndex: number) => (
                  <OrderDialogCard
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
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-3 h-3 rounded-full mr-2"></div>
                <h3 className="text-lg font-bold text-gray-800">เสิร์ฟแล้ว</h3>
                <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs">
                  {servedOrders.length} ออเดอร์
                </Badge>
              </div>
              <div className="space-y-4">
                {servedOrders.map((order: Order, orderIndex: number) => (
                  <OrderDialogCard
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
      </DialogContent>
    </Dialog>
  );
};

interface OrderDialogCardProps {
  order: Order;
  orderIndex: number;
  status: string;
  variant: "active" | "served";
}

const OrderDialogCard: React.FC<OrderDialogCardProps> = ({
  order,
  orderIndex,
  status,
  variant,
}) => {
  const isActive = variant === "active";

  const cardClass = isActive
    ? "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200"
    : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200";

  // Calculate totals - เพิ่ม type annotations
  const itemsTotal = order.items.reduce(
    (sum: number, item: OrderItem) =>
      sum + (item.menuItem?.price * item.quantity || 0),
    0
  );

  const addonsTotal = order.items.reduce(
    (sum: number, item: OrderItem) =>
      sum +
      (item.addons?.reduce(
        (addonSum: number, addon: OrderItemAddon) =>
          addonSum + addon.price * addon.quantity * item.quantity,
        0
      ) || 0),
    0
  );

  const totalItems = order.items.reduce(
    (sum: number, item: OrderItem) => sum + item.quantity,
    0
  );
  const totalAddons = order.items.reduce(
    (sum: number, item: OrderItem) =>
      sum +
      (item.addons?.reduce(
        (addonSum: number, addon: OrderItemAddon) =>
          addonSum + addon.quantity * item.quantity,
        0
      ) || 0),
    0
  );

  return (
    <Card className={`${cardClass} border-2 shadow-lg`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center">
            <div
              className={`${
                isActive ? "bg-orange-500" : "bg-green-500"
              } text-white rounded-lg p-2 mr-3`}
            >
              {isActive ? (
                <span className="text-sm font-bold">{orderIndex + 1}</span>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">
                ออเดอร์ #{order.id.slice(-6)}
              </h4>
              <p className="text-xs text-gray-500">
                {isActive ? "กำลังเตรียม" : "เสิร์ฟเรียบร้อย"}
              </p>
            </div>
          </div>
          <Badge
            className={`${getStatusColor(status)} px-3 py-1 text-xs font-bold`}
          >
            {getStatusText(status)}
          </Badge>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item: OrderItem, itemIndex: number) => (
            <div
              key={itemIndex}
              className="bg-white rounded-lg p-3 border border-gray-100"
            >
              {/* Main Item */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 text-sm">
                    {item.menuItem?.name || "เมนูลบแล้ว"}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gray-100 text-gray-700 px-2 py-1 text-xs">
                      {item.quantity} จาน
                    </Badge>
                    <span className="text-xs text-gray-500">
                      @ ฿{item.menuItem?.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {item.menuItem
                    ? `฿${(
                        item.menuItem.price * item.quantity
                      ).toLocaleString()}`
                    : "เมนูลบแล้ว"}
                </div>
              </div>

              {/* Addons */}
              {item.addons && item.addons.length > 0 && (
                <div className="mt-3 pt-2 border-t border-blue-100">
                  <div className="text-xs text-blue-600 font-medium mb-2">
                    ของเสริม:
                  </div>
                  <div className="space-y-1">
                    {item.addons.map(
                      (addon: OrderItemAddon, addonIndex: number) => (
                        <div
                          key={addonIndex}
                          className="flex justify-between items-center text-xs bg-blue-50 rounded px-2 py-1"
                        >
                          <span className="text-blue-700">
                            + {addon.name} ({addon.quantity}×{item.quantity})
                          </span>
                          <span className="font-semibold text-blue-800">
                            ฿
                            {(
                              addon.price *
                              addon.quantity *
                              item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">ยอดรวม</span>
            <span
              className={`text-lg font-bold ${
                isActive ? "text-orange-600" : "text-green-600"
              }`}
            >
              ฿{order.totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            อาหารหลัก {totalItems} จาน
            {totalAddons > 0 && ` • ของเสริม ${totalAddons} รายการ`}
          </div>
        </div>

        {/* Status */}
        <div
          className={`flex items-center justify-center mt-3 p-2 rounded-lg ${
            isActive
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {isActive ? (
              <Clock className="w-4 h-4 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isActive ? "กำลังเตรียมอาหาร..." : "เสิร์ฟเรียบร้อยแล้ว"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
