// components/bills/BillDetailModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Calendar,
  DollarSign,
  Table as TableIcon,
  ShoppingCart,
  Download,
  Printer,
  CheckCircle2,
} from "lucide-react";

interface Bill {
  id: string;
  tableId: string;
  table: {
    number: number;
  };
  totalAmount: number;
  paymentTime: string;
  paymentMethod?: string;
  orderIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface BillDetailModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: (bill: Bill) => void;
  onDownload?: (bill: Bill) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  bill,
  isOpen,
  onClose,
  onPrint,
  onDownload,
}) => {
  if (!bill) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case "cash":
        return "เงินสด";
      case "credit_card":
        return "บัตรเครดิต";
      case "transfer":
        return "โอนเงิน";
      case "qr_code":
        return "QR Code";
      default:
        return method || "ไม่ระบุ";
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(bill);
    } else {
      // Default print behavior
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(bill);
    } else {
      // Default download behavior - สร้าง text receipt
      const receiptText = generateReceiptText(bill);
      const blob = new Blob([receiptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bill-${bill.id.slice(-8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generateReceiptText = (bill: Bill) => {
    return `
=================================
       ใบเสร็จรับเงิน
=================================
เลขที่บิล: ${bill.id}
วันที่: ${formatDate(bill.paymentTime)}
โต๊ะ: ${bill.table.number}
=================================
รายการ: ${bill.orderIds.length} ออเดอร์
ยอดรวม: ${formatCurrency(bill.totalAmount)}
วิธีชำระเงิน: ${getPaymentMethodText(bill.paymentMethod)}
=================================
        ขอบคุณที่ใช้บริการ
=================================
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            รายละเอียดบิล #{bill.id.slice(-8)}
          </DialogTitle>
          <DialogDescription>
            ข้อมูลการชำระเงินและรายละเอียดการสั่งซื้อ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-green-800">การชำระเงินสำเร็จ</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(bill.totalAmount)}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Bill Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">เลขที่บิล:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {bill.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">โต๊ะ:</span>
                    <Badge variant="outline">{bill.table.number}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">จำนวนออเดอร์:</span>
                    <span>{bill.orderIds.length} ออเดอร์</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">วันที่ชำระเงิน:</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    {formatDate(bill.paymentTime)}
                  </div>
                  {bill.paymentMethod && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">วิธีชำระเงิน:</span>
                      <Badge variant="secondary">
                        {getPaymentMethodText(bill.paymentMethod)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order IDs List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ออเดอร์ที่รวมในบิลนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {bill.orderIds.map((orderId, index) => (
                  <div
                    key={orderId}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <span className="font-mono text-sm">
                      {orderId.slice(-8)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-2 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">ยอดรวมทั้งสิ้น:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(bill.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
