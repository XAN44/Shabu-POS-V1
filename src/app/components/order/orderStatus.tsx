import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
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

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center">
          <div className="bg-orange-100 p-2 rounded-lg mr-3 flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            สถานะออเดอร์ของคุณ
          </h2>
        </div>
        <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium self-start sm:self-auto">
          {totalOrders} ออเดอร์
        </span>
      </div>

      <div className="space-y-6">
        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700">
                กำลังดำเนินการ ({activeOrders.length} ออเดอร์)
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700">
                เสิร์ฟแล้ว ({servedOrders.length} ออเดอร์)
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  const cardClass =
    variant === "active"
      ? "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100"
      : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100";

  const iconClass = variant === "active" ? "bg-orange-500" : "bg-green-500";
  const icon = variant === "active" ? orderIndex + 1 : "✓";
  const amountColor =
    variant === "active" ? "text-orange-700" : "text-green-700";
  const itemBadgeColor =
    variant === "active"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-green-100 text-green-800 border-green-200";

  const borderColor =
    variant === "active" ? "border-orange-200" : "border-green-200";

  return (
    <Card
      className={`${cardClass} border shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <CardContent className="p-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center min-w-0">
            <span
              className={`${iconClass} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0`}
            >
              {icon}
            </span>
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
              ออเดอร์ #{order.id.slice(-8)}
            </h4>
          </div>
          <Badge
            className={`${getStatusColor(
              status
            )} px-2 sm:px-3 py-1 font-medium border text-xs sm:text-sm flex-shrink-0 self-start sm:self-auto`}
          >
            {getStatusText(status)}
          </Badge>
        </div>

        {/* Order Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="bg-white/70 rounded-lg p-3 border border-white/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="flex-1 font-medium text-gray-700 text-sm min-w-0">
                  {item.menuItem?.name || "เมนูลบแล้ว"}
                </p>
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  <span
                    className={`${itemBadgeColor} px-2 py-1 rounded-full text-xs font-medium border`}
                  >
                    ×{item.quantity}
                  </span>
                  <span className="font-semibold text-gray-800 text-sm min-w-[60px] text-right">
                    {item.menuItem
                      ? `฿${(
                          item.menuItem.price * item.quantity
                        ).toLocaleString()}`
                      : "เมนูลบแล้ว"}{" "}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Amount */}
        <div className={`pt-3 border-t ${borderColor}`}>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              รวม:
            </span>
            <span className={`${amountColor} font-bold text-base sm:text-lg`}>
              ฿{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
