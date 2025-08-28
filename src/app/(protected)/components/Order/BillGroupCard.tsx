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
  FileText,
  Package,
  Users,
  ShoppingBag,
  Layers,
  CreditCard,
} from "lucide-react";

interface BillGroup {
  billId: string;
  orders: (Order & { billId?: string | null })[];
}

interface BillGroupCardProps {
  billGroup: BillGroup;
  onOrderStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  showTimeAgo?: boolean;
}

export const BillGroupCard: React.FC<BillGroupCardProps> = ({
  billGroup,
  onOrderStatusChange,
  showTimeAgo = true,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // คำนวณข้อมูลรวม
  const totalAmount = billGroup.orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalItems = billGroup.orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // หาโต๊ะหลัก (โต๊ะแรก)
  const primaryTable = billGroup.orders[0]?.table;

  // ตรวจสอบว่ามีโต๊ะเดียวกันหรือไม่
  const allSameTable = billGroup.orders.every(
    (order) => order.table.id === primaryTable?.id
  );

  // คำนวณเวลาที่ผ่านมา (ใช้เวลาของออเดอร์แรก)
  const getTimeAgo = () => {
    if (billGroup.orders.length === 0) return "";

    const orderTime = new Date(billGroup.orders[0].orderTime);
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

  // กำหนดสถานะรวมของบิล
  const getBillStatus = () => {
    const statuses = billGroup.orders.map((order) => order.status);

    if (statuses.every((status) => status === "served")) {
      return "served";
    } else if (statuses.some((status) => status === "cancelled")) {
      return "mixed"; // มีบางอันยกเลิก
    } else if (statuses.some((status) => status === "new")) {
      return "new";
    } else if (statuses.some((status) => status === "preparing")) {
      return "preparing";
    } else if (statuses.some((status) => status === "ready")) {
      return "ready";
    }
    return "mixed";
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
          text: "มีออเดอร์ใหม่",
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
      case "mixed":
        return {
          badge:
            "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200",
          card: "bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-purple-200 shadow-purple-100",
          glow: "shadow-purple-200",
          icon: Layers,
          text: "สถานะผสม",
          pulse: false,
        };
      default:
        return {
          badge:
            "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-200",
          card: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 border-gray-200 shadow-gray-100",
          glow: "shadow-gray-200",
          icon: FileText,
          text: "รอดำเนินการ",
          pulse: false,
        };
    }
  };

  const billStatus = getBillStatus();
  const statusConfig = getStatusConfig(billStatus);
  const StatusIcon = statusConfig.icon;

  // ฟังก์ชันจัดการแต่ละออเดอร์
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      await onOrderStatusChange(orderId, newStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div
      className={`transform transition-all duration-300 ${
        isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <Card
        className={`
          ${statusConfig.card}
          border shadow-xl
          ${statusConfig.glow}
          backdrop-blur-sm
          transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
          relative overflow-hidden group
        `}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent opacity-80"></div>

        {/* Bill Indicator */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-lg">
          <CreditCard className="w-3 h-3 inline mr-1" />
          บิลเดียวกัน
        </div>

        <CardHeader className="relative pb-4 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">
                    {billGroup.orders.length}
                  </span>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {allSameTable ? `โต๊ะ ${primaryTable?.number}` : "หลายโต๊ะ"}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <FileText className="w-3 h-3 sm:w-3 sm:h-3" />
                    <span className="font-mono">
                      บิล: {billGroup.billId.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-purple-600">
                    <Package className="w-3 h-3" />
                    <span>{billGroup.orders.length} ออเดอร์</span>
                  </div>
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
            </div>
          </div>

          {/* Table and Time Info */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {!allSameTable && (
                <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/50 shadow-sm">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    โต๊ะ:{" "}
                    {[
                      ...new Set(billGroup.orders.map((o) => o.table.number)),
                    ].join(", ")}
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
          {/* Bill Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-800">สรุปบิล</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {billGroup.orders.length}
                </div>
                <div className="text-xs text-gray-600 font-medium">ออเดอร์</div>
              </div>
              <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {totalItems}
                </div>
                <div className="text-xs text-gray-600 font-medium">รายการ</div>
              </div>
              <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                <div className="text-lg font-bold text-green-600 mb-1">
                  ฿{totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">ยอดรวม</div>
              </div>
            </div>
          </div>

          {/* Individual Orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  รายการออเดอร์
                </h4>
              </div>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              {billGroup.orders.map((order, index) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Order Header */}
                    <div
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              ออเดอร์ #{order.id.slice(-6)}
                            </span>
                            <Badge
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                order.status === "new"
                                  ? "bg-red-100 text-red-700"
                                  : order.status === "preparing"
                                  ? "bg-orange-100 text-orange-700"
                                  : order.status === "ready"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "served"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status === "new"
                                ? "ใหม่"
                                : order.status === "preparing"
                                ? "ทำ"
                                : order.status === "ready"
                                ? "เสร็จ"
                                : order.status === "served"
                                ? "เสิร์ฟ"
                                : "ยกเลิก"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {order.items.length} รายการ • ฿
                            {order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <ArrowRight
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item, itemIndex) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-start text-sm"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-gray-800">
                                  {item.menuItem.name}
                                </span>
                                {item.notes && (
                                  <div className="text-xs text-amber-600 mt-1">
                                    หมายเหตุ: {item.notes}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-2 flex-shrink-0">
                                <div className="text-sm font-semibold text-gray-800">
                                  x{item.quantity}
                                </div>
                                <div className="text-xs text-green-600">
                                  ฿{item.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="flex gap-2 pt-2">
                          {order.status === "new" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(order.id, "preparing")
                                }
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm text-xs h-8 px-3"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                รับ
                              </Button>
                            </>
                          )}
                          {order.status === "preparing" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "ready")
                              }
                              disabled={isProcessing}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm text-xs h-8 px-3"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              เสร็จ
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(order.id, "served")
                              }
                              disabled={isProcessing}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm text-xs h-8 px-3"
                            >
                              <Utensils className="w-3 h-3 mr-1" />
                              เสิร์ฟ
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Actions */}
          {billStatus === "served" && (
            <div className="flex justify-center pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  window.open(`/receipt?billId=${billGroup.billId}`, "_blank")
                }
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 h-10 rounded-xl font-semibold px-6"
              >
                <Receipt className="w-4 h-4 mr-2" />
                พิมพ์ใบเสร็จบิล
              </Button>
            </div>
          )}

          {/* Order Time Info */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 font-medium text-center">
              สร้างบิลเมื่อ:{" "}
              {new Date(billGroup.orders[0].orderTime).toLocaleString("th-TH")}
            </span>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-xl border">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-base font-semibold text-gray-700">
                  กำลังดำเนินการ...
                </span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
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
