// components/orders/OrderCard.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/src/app/types/Order";
import {
  Clock,
  MapPin,
  ChefHat,
  CheckCircle2,
  Utensils,
  User,
  Receipt,
  Timer,
  AlertCircle,
  Play,
  Pause,
  Check,
} from "lucide-react";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  showTimeAgo?: boolean;
  isUrgent?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  showTimeAgo = true,
  isUrgent = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // คำนวณเวลาที่ผ่านมา
  const getTimeAgo = () => {
    const orderTime = new Date(order.orderTime);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "เมื่อสักครู่";
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} วันที่แล้ว`;
  };

  // กำหนดสีตามสถานะ
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-500 text-white";
      case "preparing":
        return "bg-orange-500 text-white";
      case "ready":
        return "bg-green-500 text-white";
      case "served":
        return "bg-blue-500 text-white";
      case "cancelled":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // กำหนดข้อความสถานะ
  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "ออเดอร์ใหม่";
      case "preparing":
        return "กำลังทำ";
      case "ready":
        return "พร้อมเสิร์ฟ";
      case "served":
        return "เสิร์ฟแล้ว";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  // กำหนดไอคอนตามสถานะ
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <CheckCircle2 className="w-4 h-4" />;
      case "served":
        return <Utensils className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // ปุ่มการดำเนินการตามสถานะ
  const getActionButtons = () => {
    switch (order.status) {
      case "new":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusChange("preparing")}
              disabled={isProcessing}
              className="bg-orange-500 hover:bg-orange-600 flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              รับออเดอร์
            </Button>
          </div>
        );

      case "preparing":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("new")}
              disabled={isProcessing}
            >
              <Pause className="w-4 h-4 mr-1" />
              หยุด
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("ready")}
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600 flex-1"
            >
              <Check className="w-4 h-4 mr-1" />
              เสร็จแล้ว
            </Button>
          </div>
        );

      case "ready":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("preparing")}
              disabled={isProcessing}
            >
              <ChefHat className="w-4 h-4 mr-1" />
              กลับครัว
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("served")}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 flex-1"
            >
              <Utensils className="w-4 h-4 mr-1" />
              เสิร์ฟแล้ว
            </Button>
          </div>
        );

      case "served":
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="text-xs"
            >
              <Receipt className="w-4 h-4 mr-1" />
              พิมพ์ใบเสร็จ
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardClasses = `
    ${isUrgent ? "border-red-500 border-2 shadow-lg animate-pulse" : ""}
    ${order.status === "new" ? "bg-red-50" : ""}
    ${order.status === "preparing" ? "bg-orange-50" : ""}
    ${order.status === "ready" ? "bg-green-50" : ""}
    ${order.status === "served" ? "bg-blue-50" : ""}
  `;

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            โต๊ะ {order.table.number}
            {isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                ด่วน!
              </Badge>
            )}
          </CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{getStatusText(order.status)}</span>
          </Badge>
        </div>

        {/* Customer Info & Time */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-1">
            {order.customerName && (
              <>
                <User className="w-3 h-3" />
                {order.customerName}
              </>
            )}
          </div>
          {showTimeAgo && (
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {getTimeAgo()}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">รายการอาหาร:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.menuItem.name}</span>
                  {item.notes && (
                    <div className="text-xs text-gray-500 italic">
                      หมายเหตุ: {item.notes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">x{item.quantity}</div>
                  <div className="text-xs text-gray-500">
                    ฿{item.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-yellow-50 p-2 rounded text-sm">
            <strong>หมายเหตุ:</strong> {order.notes}
          </div>
        )}

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">รวมทั้งสิ้น:</span>
          <span className="text-lg font-bold text-green-600">
            ฿{order.totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">{getActionButtons()}</div>

        {/* Order Time Info */}
        <div className="text-xs text-gray-500 text-center pt-1">
          สั่งเมื่อ: {new Date(order.orderTime).toLocaleString("th-TH")}
        </div>
      </CardContent>
    </Card>
  );
};
