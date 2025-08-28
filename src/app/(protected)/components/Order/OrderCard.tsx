"use client";

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
  X,
  Zap,
  Star,
  Sparkles,
  ArrowRight,
  DollarSign,
  Hash,
  Calendar,
  Activity,
  Target,
  Award,
  TrendingUp,
  Flame,
} from "lucide-react";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  showTimeAgo?: boolean;
  isUrgent?: boolean;
  handleDelete?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  showTimeAgo = true,
  isUrgent = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleDeleteOrder = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("ลบออเดอร์ไม่สำเร็จ");

      setIsFadingOut(true);
      setTimeout(() => setIsDeleted(true), 300);
    } catch (error) {
      console.error("❌ ลบออเดอร์ผิดพลาด:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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

  // กำหนดสีและสไตล์ตามสถานะ
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new":
        return {
          badge:
            "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-200",
          card: "bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-red-200 shadow-red-100",
          glow: "shadow-red-200",
          icon: Clock,
          text: "ออเดอร์ใหม่",
          pulse: true,
        };
      case "preparing":
        return {
          badge:
            "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200",
          card: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-orange-200 shadow-orange-100",
          glow: "shadow-orange-200",
          icon: ChefHat,
          text: "กำลังทำ",
          pulse: false,
        };
      case "ready":
        return {
          badge:
            "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200",
          card: "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-green-200 shadow-green-100",
          glow: "shadow-green-200",
          icon: CheckCircle2,
          text: "พร้อมเสิร์ฟ",
          pulse: false,
        };
      case "served":
        return {
          badge:
            "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200",
          card: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-blue-200 shadow-blue-100",
          glow: "shadow-blue-200",
          icon: Utensils,
          text: "เสิร์ฟแล้ว",
          pulse: false,
        };
      case "cancelled":
        return {
          badge:
            "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-200",
          card: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 border-gray-200 shadow-gray-100",
          glow: "shadow-gray-200",
          icon: AlertCircle,
          text: "ยกเลิก",
          pulse: false,
        };
      default:
        return {
          badge:
            "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-200",
          card: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 border-gray-200 shadow-gray-100",
          glow: "shadow-gray-200",
          icon: Clock,
          text: status,
          pulse: false,
        };
    }
  };

  // ปุ่มการดำเนินการตามสถานะ
  const getActionButtons = () => {
    switch (order.status) {
      case "new":
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              size="sm"
              onClick={() => handleStatusChange("preparing")}
              disabled={isProcessing}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              รับออเดอร์
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteOrder}
              disabled={isProcessing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
          </div>
        );

      case "preparing":
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("new")}
              disabled={isProcessing}
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              หยุด
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("ready")}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <Check className="w-4 h-4 mr-2" />
              เสร็จแล้ว
            </Button>
          </div>
        );

      case "ready":
        return (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("preparing")}
              disabled={isProcessing}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              กลับครัว
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("served")}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 h-9 sm:h-10 rounded-lg sm:rounded-xl font-semibold text-sm"
            >
              <Utensils className="w-4 h-4 mr-2" />
              เสิร์ฟแล้ว
            </Button>
          </div>
        );
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

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  if (isDeleted) return null;

  return (
    <div
      className={`transform transition-all duration-300 ${
        isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      } ${isUrgent ? "animate-pulse" : ""}`}
    >
      <Card
        className={`
          ${statusConfig.card}
          ${
            isUrgent
              ? "border-2 border-red-500 shadow-2xl shadow-red-200"
              : "border shadow-xl"
          }
          ${statusConfig.glow}
          backdrop-blur-sm
          transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
          relative overflow-hidden group
        `}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent opacity-80"></div>

        {/* Urgent Indicator */}
        {isUrgent && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-red-500">
            <div className="absolute -top-8 -right-1 text-white">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        )}

        <CardHeader className="relative pb-4 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">
                    {order.table.number}
                  </span>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  โต๊ะ {order.table.number}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <Hash className="w-3 h-3 sm:w-3 sm:h-3" />
                    <span className="font-mono">{order.id.slice(-8)}</span>
                  </div>
                  {isUrgent && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg animate-pulse px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      ด่วน!
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <Badge
                className={`${
                  statusConfig.badge
                } px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm ${
                  statusConfig.pulse ? "animate-pulse" : ""
                }`}
              >
                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {statusConfig.text}
              </Badge>
              {order.status === "new" && (
                <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <Activity className="w-3 h-3" />
                  ต้องดำเนินการ
                </div>
              )}
            </div>
          </div>

          {/* Customer & Time Info */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {order.customerName && (
                <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/50 shadow-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {order.customerName}
                  </span>
                </div>
              )}
            </div>
            {showTimeAgo && (
              <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/50 shadow-sm">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {getTimeAgo()}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Order Items */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-800">
                รายการอาหาร
              </h4>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              <Badge
                variant="outline"
                className="bg-white/60 backdrop-blur-sm border-gray-200 text-gray-600 font-semibold text-xs"
              >
                {order.items.length} รายการ
              </Badge>
            </div>

            <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                        {item.menuItem.name}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="ml-7 sm:ml-8 px-2 py-1.5 sm:px-3 sm:py-2 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">
                            หมายเหตุ:
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-800 mt-1">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                    <div className="flex items-center justify-end gap-1 sm:gap-2 mb-1">
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-bold">
                        x{item.quantity}
                      </div>
                    </div>
                    <div className="text-sm sm:text-lg font-bold text-green-600">
                      ฿{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl sm:rounded-2xl opacity-80"></div>
              <div className="relative p-3 sm:p-4 border border-yellow-200 rounded-xl sm:rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-amber-800">
                    หมายเหตุพิเศษ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 font-medium ml-7 sm:ml-8">
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl opacity-80"></div>
            <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 border border-green-200 rounded-xl sm:rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-base sm:text-lg font-bold text-green-800">
                  ยอดรวมทั้งสิ้น
                </span>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ฿{order.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  รายการ
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">{getActionButtons()}</div>

          {/* Order Time Info */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs sm:text-sm text-gray-600 font-medium text-center">
              สั่งเมื่อ: {new Date(order.orderTime).toLocaleString("th-TH")}
            </span>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
              <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-white rounded-xl sm:rounded-2xl shadow-xl border">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base font-semibold text-gray-700">
                  กำลังดำเนินการ...
                </span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl"></div>
      </Card>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1d4ed8, #1e40af);
        }
      `}</style>
    </div>
  );
};
