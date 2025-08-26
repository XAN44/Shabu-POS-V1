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

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <div className="bg-orange-100 p-2 rounded-lg mr-3">
          <ShoppingCart className="w-5 h-5 text-orange-600" />
        </div>
        สถานะออเดอร์ของคุณ
        <span className="ml-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          {activeOrders.length + servedOrders.length} ออเดอร์
        </span>
      </h2>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            กำลังดำเนินการ ({activeOrders.length} ออเดอร์)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
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

      {/* Served Orders */}
      {servedOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            เสิร์ฟแล้ว ({servedOrders.length} ออเดอร์)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
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
      ? "bg-gradient-to-br from-orange-50 to-yellow-50"
      : "bg-gradient-to-br from-green-50 to-emerald-50";

  const iconClass = variant === "active" ? "bg-orange-500" : "bg-green-500";
  const icon = variant === "active" ? orderIndex + 1 : "✓";
  const amountColor =
    variant === "active" ? "text-orange-600" : "text-green-600";
  const itemBadgeColor =
    variant === "active"
      ? "bg-orange-100 text-orange-800"
      : "bg-green-100 text-green-800";

  return (
    <Card
      className={`${cardClass} border-0 shadow-md hover:shadow-lg transition-shadow`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <span
              className={`${iconClass} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2`}
            >
              {icon}
            </span>
            ออเดอร์ #{order.id.slice(-8)}
          </h4>
          <Badge
            className={`${getStatusColor(status)} px-3 py-1 font-medium border`}
          >
            {getStatusText(status)}
          </Badge>
        </div>

        <div className="space-y-2">
          {order.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="flex justify-between items-center text-sm bg-white/70 rounded-lg p-2"
            >
              <p className="flex-1 font-medium text-gray-700">
                {item.menuItem.name}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`${itemBadgeColor} px-2 py-1 rounded-full text-xs font-medium`}
                >
                  ×{item.quantity}
                </span>
                <span className="font-semibold text-gray-800 min-w-[60px] text-right">
                  ฿{(item.menuItem.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-3 pt-2 border-t ${
            variant === "active" ? "border-orange-200" : "border-green-200"
          }`}
        >
          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-700">รวม:</span>
            <span className={amountColor}>
              ฿{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
