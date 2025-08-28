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
  Info,
  Banknote,
  QrCode,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { Table, Order } from "@/src/app/types/Order";
import { toast } from "sonner";
import { useSocketContext } from "@/src/app/providers/SocketProvider";

interface CheckoutButtonProps {
  table: Table;
  orders: Order[];
  onCheckoutComplete?: () => void;
  disabled?: boolean;
}

type CheckoutStep =
  | "review"
  | "payment-method"
  | "cash-waiting"
  | "qrcode"
  | "complete";
type PaymentMethod = "cash" | "qrcode";

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  table,
  orders,
  onCheckoutComplete,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [billedOrderIds, setBilledOrderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Reset states when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setCurrentStep("review");
      setSelectedPaymentMethod(null);
      setIsProcessing(false);
    }
  };

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
  }, [table.id]);

  // ดึงข้อมูลบิลเมื่อ component mount หรือเมื่อเปิด dialog
  useEffect(() => {
    fetchExistingBills();
  }, [fetchExistingBills]);

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

  const hasIncompleteOrders = pendingOrders.some(
    (order) => order.status !== "served"
  );

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method === "cash") {
      setCurrentStep("cash-waiting");
    } else if (method === "qrcode") {
      setCurrentStep("qrcode");
    }
  };

  // Handle cash payment confirmation
  const handleCashPaymentConfirm = async () => {
    await processCheckout("cash");
  };

  // Handle QR code payment
  const handleQRPayment = async () => {
    await processCheckout("qrcode");
  };

  // Process the actual checkout
  const processCheckout = async (paymentMethod: PaymentMethod) => {
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
        body: JSON.stringify({
          paymentMethod: paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถเช็คบิลได้");
      }

      setCurrentStep("complete");

      toast.success("เช็คบิลสำเร็จ!", {
        duration: 5000,
      });

      // รีเฟรชข้อมูลบิลที่มีอยู่
      await fetchExistingBills();

      // ปิด dialog หลังจาก 2 วินาที
      setTimeout(() => {
        setIsOpen(false);
        setCurrentStep("review");
        setSelectedPaymentMethod(null);
        onCheckoutComplete?.();
      }, 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเช็คบิล"
      );
      setCurrentStep("payment-method"); // Go back to payment method selection
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case "payment-method":
        setCurrentStep("review");
        break;
      case "cash-waiting":
      case "qrcode":
        setCurrentStep("payment-method");
        setSelectedPaymentMethod(null);
        break;
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

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 lg:py-12">
          <Loader2 className="w-8 h-8 lg:w-12 lg:h-12 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-gray-600 text-sm lg:text-base">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case "review":
        return renderReviewStep();
      case "payment-method":
        return renderPaymentMethodStep();
      case "cash-waiting":
        return renderCashWaitingStep();
      case "qrcode":
        return renderQRCodeStep();
      case "complete":
        return renderCompleteStep();
      default:
        return renderReviewStep();
    }
  };

  const renderReviewStep = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* สรุปยอดที่ต้องเช็คบิล */}
      {hasOrdersToCheckout && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 lg:p-4">
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-2">
              <span className="font-semibold text-sm lg:text-base">
                ยอดที่ต้องเช็คบิล
              </span>
              <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-blue-700">
                ฿{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              {pendingOrders.length} ออเดอร์ • {totalItems} รายการ
            </div>
          </CardContent>
        </Card>
      )}

      {/* ไม่มีออเดอร์ที่ต้องเช็คบิล */}
      {!hasOrdersToCheckout && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-semibold text-sm lg:text-base">
                ไม่มีออเดอร์ที่ต้องเช็คบิล
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              ออเดอร์ทั้งหมดในโต๊ะนี้ได้เช็คบิลไปแล้ว
            </p>
          </CardContent>
        </Card>
      )}

      {/* แจ้งเตือนถ้ายังมีออเดอร์ไม่เสร็จ */}
      {hasIncompleteOrders && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-start gap-2 text-orange-700">
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-sm lg:text-base block">
                  คำเตือน
                </span>
                <p className="text-xs lg:text-sm text-orange-600 mt-1">
                  ยังมีออเดอร์ที่ยังไม่เสร็จสิ้น
                  การเช็คบิลจะอัปเดตออเดอร์ทั้งหมดให้เป็น &quot;เสิร์ฟแล้ว&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* รายละเอียดออเดอร์ที่ยังไม่เช็คบิล */}
      <div>
        <h2 className="text-base lg:text-lg xl:text-xl font-semibold mb-3 lg:mb-4">
          ออเดอร์ทั้งหมด: {pendingOrders.length} รายการ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {pendingOrders.map((order) => (
            <Card
              key={order.id}
              className="border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3 lg:p-4 flex flex-col h-full">
                {/* Header: เวลา + สถานะ */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs lg:text-sm text-gray-600 truncate">
                      {new Date(order.orderTime).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <span className="hidden lg:inline">
                      {getStatusText(order.status)}
                    </span>
                    <span className="lg:hidden">
                      {order.status === "new"
                        ? "ใหม่"
                        : order.status === "preparing"
                        ? "ทำ"
                        : order.status === "ready"
                        ? "เสร็จ"
                        : order.status === "served"
                        ? "ส่ง"
                        : order.status}
                    </span>
                  </span>
                </div>

                {/* รายการเมนู */}
                <div className="flex-1 overflow-hidden">
                  <ul className="space-y-1 lg:space-y-2 text-xs lg:text-sm max-h-32 lg:max-h-40 overflow-y-auto">
                    {order.items.map((item, index) => (
                      <li
                        key={`${item.menuItemId}-${index}`}
                        className="flex justify-between items-start gap-2 border-b border-gray-100 pb-1 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {item.quantity} × {item.menuItem.name}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-0.5 break-words">
                              ({item.notes})
                            </div>
                          )}
                        </div>
                        <span className="font-medium flex-shrink-0">
                          ฿{item.price.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer: จำนวนรวม + ยอดรวม */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 font-medium text-sm lg:text-base">
                  <span className="text-gray-600">
                    รวม {order.items.length} รายการ
                  </span>
                  <span className="text-lg lg:text-xl font-bold">
                    ฿{order.totalAmount.toLocaleString()}
                  </span>
                </div>

                {order.customerName && (
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    ลูกค้า: {order.customerName}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">เลือกวิธีชำระเงิน</h3>
        <p className="text-gray-600">ยอดรวม: ฿{totalAmount.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Payment */}
        <Card
          className="border-2 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
          onClick={() => handlePaymentMethodSelect("cash")}
        >
          <CardContent className="p-6 text-center">
            <Banknote className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h4 className="text-lg font-semibold mb-2">เงินสด</h4>
            <p className="text-sm text-gray-600">รับชำระด้วยเงินสด</p>
          </CardContent>
        </Card>

        {/* QR Code Payment */}
        <Card
          className="border-2 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
          onClick={() => handlePaymentMethodSelect("qrcode")}
        >
          <CardContent className="p-6 text-center">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h4 className="text-lg font-semibold mb-2">QR Code</h4>
            <p className="text-sm text-gray-600">สแกน QR Code เพื่อชำระ</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCashWaitingStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-semibold mb-2">รอรับเงินสด</h3>
        <p className="text-gray-600 mb-4">
          ยอดที่ต้องชำระ:{" "}
          <span className="font-bold text-2xl">
            ฿{totalAmount.toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          รอลูกค้าชำระเงิน เมื่อได้รับเงินแล้วกดปุ่ม &quot;รับเงินแล้ว&quot;
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-700">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">รอการชำระเงิน...</span>
        </div>
      </div>
    </div>
  );

  const renderQRCodeStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          สแกน QR Code เพื่อชำระเงิน
        </h3>
        <p className="text-gray-600 mb-4">
          ยอดที่ต้องชำระ:{" "}
          <span className="font-bold text-2xl">
            ฿{totalAmount.toLocaleString()}
          </span>
        </p>
      </div>

      {/* QR Code Placeholder */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">QR Code สำหรับชำระเงิน</p>
            <p className="text-xs text-gray-400 mt-1">
              (ในการใช้งานจริงจะแสดง QR Code จาก Payment Gateway)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            ให้ลูกค้าสแกน QR Code นี้เพื่อชำระเงิน เมื่อชำระสำเร็จแล้วกดปุ่ม
            &quot;ชำระแล้ว&quot;
          </span>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8 lg:py-12">
      <CheckCircle2 className="w-12 h-12 lg:w-16 lg:h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg lg:text-xl font-semibold text-green-700 mb-2">
        เช็คบิลสำเร็จ!
      </h3>
      <p className="text-gray-600 text-sm lg:text-base mb-2">
        ชำระเงินด้วย{selectedPaymentMethod === "cash" ? "เงินสด" : "QR Code"}
      </p>
      <p className="text-gray-600 text-sm lg:text-base">
        ยอดรวม: ฿{totalAmount.toLocaleString()}
      </p>
    </div>
  );

  const renderFooterButtons = () => {
    switch (currentStep) {
      case "review":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {hasOrdersToCheckout ? "ยกเลิก" : "ปิด"}
            </Button>
            {hasOrdersToCheckout && (
              <Button
                onClick={() => setCurrentStep("payment-method")}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
              >
                <Receipt className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                เช็คบิล
              </Button>
            )}
          </>
        );

      case "payment-method":
        return (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        );

      case "cash-waiting":
        return (
          <>
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isProcessing}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <Button
              onClick={handleCashPaymentConfirm}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  รับเงินแล้ว
                </>
              )}
            </Button>
          </>
        );

      case "qrcode":
        return (
          <>
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isProcessing}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <Button
              onClick={handleQRPayment}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  ชำระแล้ว
                </>
              )}
            </Button>
          </>
        );

      case "complete":
        return null; // Auto close after 2 seconds

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
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
          className={`min-w-0 flex-shrink-0
    ${
      !hasOrdersToCheckout
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
        : hasIncompleteOrders
        ? "border-orange-200 text-orange-700 hover:bg-orange-50"
        : "bg-green-600 hover:bg-green-700 text-white"
    }`}
        >
          <Receipt className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2 flex-shrink-0" />
          <span className="hidden xs:inline">
            {!hasOrdersToCheckout
              ? "เช็คบิลแล้ว"
              : hasIncompleteOrders
              ? "เช็คบิล (รอ)"
              : "เช็คบิล"}
          </span>
          <span className="xs:hidden text-xs">
            {!hasOrdersToCheckout
              ? "แล้ว"
              : hasIncompleteOrders
              ? "กดเพื่อเช็คบิล"
              : "บิล"}
          </span>
          {hasOrdersToCheckout && (
            <span className="hidden xs:inline ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
              ฿{totalAmount.toLocaleString()}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[98vw] sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] 2xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
            <span className="truncate font-bold">
              เช็คบิลโต๊ะ {table.number}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm md:text-base text-gray-600">
            {currentStep === "review"
              ? hasOrdersToCheckout
                ? "รวมบิลออเดอร์ที่ยังไม่ได้เช็คบิลในโต๊ะนี้"
                : "ออเดอร์ทั้งหมดในโต๊ะนี้เช็คบิลแล้ว"
              : currentStep === "payment-method"
              ? "เลือกวิธีการชำระเงิน"
              : currentStep === "cash-waiting"
              ? "รอลูกค้าชำระด้วยเงินสด"
              : currentStep === "qrcode"
              ? "ให้ลูกค้าสแกน QR Code เพื่อชำระเงิน"
              : "การชำระเงินเสร็จสิ้น"}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
