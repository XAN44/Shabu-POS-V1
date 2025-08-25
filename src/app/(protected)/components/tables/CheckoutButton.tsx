// components/tables/CheckoutButton.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Receipt,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Info,
} from "lucide-react";
import { Table, Order } from "@/src/app/types/Order";
import { toast } from "sonner";

interface CheckoutButtonProps {
  table: Table;
  orders: Order[];
  onCheckoutComplete?: () => void;
  disabled?: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  table,
  orders,
  onCheckoutComplete,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลบิลที่มีอยู่แล้วเพื่อตรวจสอบออเดอร์ที่เช็คบิลแล้ว
  const fetchExistingBills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bills?tableId=${table.id}`);
      if (response.ok) {
        const bills: Array<{ orderIds: string[] }> = await response.json();
        const billedIds = new Set<string>(
          bills.flatMap((bill) => bill.orderIds)
        );
        setBilledOrderIds(billedIds);
      }
    } catch (error) {
      console.error("Failed to fetch existing bills:", error);
    } finally {
      setLoading(false);
    }
  }, [table.id]); // 👈 table.id เป็น dependency ที่แท้จริง

  // ดึงข้อมูลบิลเมื่อ component mount หรือเมื่อเปิด dialog
  useEffect(() => {
    fetchExistingBills();
  }, [fetchExistingBills]); // ✅ ปลอดภัยและ clean

  // กรองออเดอร์ที่ยังไม่ได้เช็คบิล (ไม่รวมออเดอร์ที่ยกเลิกและออเดอร์ที่เช็คบิลแล้ว)
  const pendingOrders = orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      order.tableId === table.id &&
      !billedOrderIds.has(order.id)
  );

  // กรองออเดอร์ที่เช็คบิลแล้ว
  const billedOrders = orders.filter(
    (order) => order.tableId === table.id && billedOrderIds.has(order.id)
  );

  // คำนวณยอดรวมของออเดอร์ที่ยังไม่เช็คบิล
  const totalAmount = pendingOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  // นับจำนวนรายการทั้งหมดที่ยังไม่เช็คบิล
  const totalItems = pendingOrders.reduce(
    (sum, order) => sum + (order.items?.length || 0),
    0
  );

  // ตรวจสอบว่ามีออเดอร์ที่ต้องเช็คบิลหรือไม่
  const hasOrdersToCheckout = pendingOrders.length > 0;

  // ตรวจสอบออเดอร์ที่ยังไม่เสร็จ (ในออเดอร์ที่ยังไม่เช็คบิล)
  const hasIncompleteOrders = pendingOrders.some(
    (order) => order.status !== "served"
  );

  const handleCheckout = async () => {
    if (!hasOrdersToCheckout) {
      toast.error("ไม่มีออเดอร์ที่ต้องเช็คบิล");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/tables/${table.id}/checkout`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถเช็คบิลได้");
      }

      setCheckoutComplete(true);

      toast.success("เช็คบิลสำเร็จ!", {
        description: `บิลเลขที่ ${result.bill.id.slice(
          -8
        )} - ฿${result.bill.totalAmount.toLocaleString()} (${
          result.ordersBilled
        } ออเดอร์)`,
        duration: 5000,
      });

      // รีเฟรชข้อมูลบิลที่มีอยู่
      await fetchExistingBills();

      // ปิด dialog หลังจาก 2 วินาที
      setTimeout(() => {
        setIsOpen(false);
        setCheckoutComplete(false);
        onCheckoutComplete?.();
      }, 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเช็คบิล"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ไม่แสดงปุ่มถ้าไม่มีออเดอร์ที่ต้องเช็คบิลและไม่มีออเดอร์เช็คบิลแล้วด้วย
  if (!hasOrdersToCheckout && billedOrders.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-red-600 bg-red-50";
      case "preparing":
        return "text-orange-600 bg-orange-50";
      case "ready":
        return "text-blue-600 bg-blue-50";
      case "served":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={
            !hasOrdersToCheckout
              ? "secondary"
              : hasIncompleteOrders
              ? "outline"
              : "default"
          }
          size="sm"
          disabled={disabled || isProcessing || loading}
          className={`${
            !hasOrdersToCheckout
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : hasIncompleteOrders
              ? "border-orange-200 text-orange-700 hover:bg-orange-50"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <Receipt className="w-4 h-4 mr-2" />
          {!hasOrdersToCheckout
            ? "เช็คบิลแล้ว"
            : hasIncompleteOrders
            ? "เช็คบิล (รอ)"
            : "เช็คบิล"}
          {hasOrdersToCheckout && (
            <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
              ฿{totalAmount.toLocaleString()}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            เช็คบิลโต๊ะ {table.number}
          </DialogTitle>
          <DialogDescription>
            {hasOrdersToCheckout
              ? "รวมบิลออเดอร์ที่ยังไม่ได้เช็คบิลในโต๊ะนี้"
              : "ออเดอร์ทั้งหมดในโต๊ะนี้เช็คบิลแล้ว"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : checkoutComplete ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              เช็คบิลสำเร็จ!
            </h3>
            <p className="text-gray-600">
              เช็คบิลออเดอร์ที่รออยู่เรียบร้อยแล้ว
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* สรุปยอดที่ต้องเช็คบิล */}
            {hasOrdersToCheckout && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">ยอดที่ต้องเช็คบิล</span>
                    <span className="text-2xl font-bold text-blue-700">
                      ฿{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pendingOrders.length} ออเดอร์ • {totalItems} รายการ
                  </div>
                </CardContent>
              </Card>
            )}

            {/* แสดงข้อมูลออเดอร์ที่เช็คบิลแล้ว */}
            {billedOrders.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">เช็คบิลแล้ว</span>
                  </div>
                  <div className="text-sm text-green-600">
                    {billedOrders.length} ออเดอร์ • ฿
                    {billedOrders
                      .reduce((sum, order) => sum + order.totalAmount, 0)
                      .toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ไม่มีออเดอร์ที่ต้องเช็คบิล */}
            {!hasOrdersToCheckout && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Info className="w-5 h-5" />
                    <span className="font-semibold">
                      ไม่มีออเดอร์ที่ต้องเช็คบิล
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ออเดอร์ทั้งหมดในโต๊ะนี้ได้เช็คบิลไปแล้ว
                  </p>
                </CardContent>
              </Card>
            )}

            {/* แจ้งเตือนถ้ายังมีออเดอร์ไม่เสร็จ */}
            {hasIncompleteOrders && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">คำเตือน</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    ยังมีออเดอร์ที่ยังไม่เสร็จสิ้น
                    การเช็คบิลจะอัปเดตออเดอร์ทั้งหมดให้เป็น
                    &quot;เสิร์ฟแล้ว&quot;
                  </p>
                </CardContent>
              </Card>
            )}

            {/* รายละเอียดออเดอร์ที่ยังไม่เช็คบิล */}
            {pendingOrders.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  ออเดอร์ที่ต้องเช็คบิล:
                </h4>
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(order.orderTime).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {order.items?.length || 0} รายการ
                        </span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">
                            ฿{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {order.customerName && (
                        <p className="text-xs text-gray-500 mt-1">
                          ลูกค้า: {order.customerName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!checkoutComplete && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
              >
                {hasOrdersToCheckout ? "ยกเลิก" : "ปิด"}
              </Button>
              {hasOrdersToCheckout && (
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังประมวลผล...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      ยืนยันเช็คบิล
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
