import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  CreditCard,
  Receipt,
  AlertTriangle,
  X,
  ShoppingBag,
  Clock,
  Banknote,
} from "lucide-react";

interface CheckoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableNumber: string;
  numberTable: string;
  orderCount: number;
  totalAmount: number;
  isProcessing?: boolean;
}

export const CheckoutConfirmationDialog: React.FC<
  CheckoutConfirmationProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  tableNumber,
  orderCount,
  totalAmount,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur">
        {/* Header */}
        <CardHeader className="text-center pb-4 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-800">
            ยืนยันการเช็คเอาท์
          </CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4">
          {/* Table Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">
                  โต๊ะที่ {tableNumber}
                </h3>
                <p className="text-blue-600 text-sm">พร้อมสำหรับการเช็คเอาท์</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">จำนวนออเดอร์</span>
              </div>
              <span className="font-semibold text-gray-800">
                {orderCount} รายการ
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">สถานะ</span>
              </div>
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                เสิร์ฟครบแล้ว
              </span>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-6 h-6" />
                  <span className="text-lg font-medium">ยอดรวมทั้งหมด</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ฿{totalAmount.toLocaleString()}
                  </div>
                  <div className="text-green-100 text-sm">รวม VAT แล้ว</div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium text-sm">
                  การดำเนินการนี้ไม่สามารถยกเลิกได้
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  โต๊ะจะถูกล้างและพร้อมสำหรับลูกค้าคนต่อไป
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
              disabled={isProcessing}
            >
              ยกเลิก
            </Button>

            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ยืนยันเช็คเอาท์
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
