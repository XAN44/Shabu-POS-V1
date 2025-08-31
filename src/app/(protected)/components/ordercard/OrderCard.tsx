// components/orders/OrderCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin } from "lucide-react";
import { Order } from "@/src/app/types/Order";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
}

const statusColors = {
  new: "bg-blue-500",
  preparing: "bg-orange-500",
  ready: "bg-green-500",
  served: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels = {
  new: "ออเดอร์ใหม่",
  preparing: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
  served: "เสิร์ฟแล้ว",
  cancelled: "ยกเลิก",
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      new: "preparing",
      preparing: "ready",
      ready: "served",
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              โต๊ะ {order.table?.number || "ไม่สามารถระบุโต๊ะ"}
            </div>
          </CardTitle>
          <Badge className={`${statusColors[order.status]} text-white`}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            เวลา: {formatTime(order.orderTime)}
            {order.customerName && (
              <span className="ml-2">
                <Users className="w-4 h-4 inline mr-1" />
                {order.customerName}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.menuItem.name} x{item.quantity}
                </span>
                <span>฿{item.price}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold">รวม: ฿{order.totalAmount}</span>
            {nextStatus && (
              <Button
                size="sm"
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="ml-2"
              >
                {statusLabels[nextStatus as keyof typeof statusLabels]}
              </Button>
            )}
          </div>

          {order.notes && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              หมายเหตุ: {order.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
