// components/bill/BillModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Receipt, X } from "lucide-react";
import { BillSummary, Order } from "../../types/menu";

interface BillModalProps {
  isOpen: boolean;
  billSummary: BillSummary | null;
  tableId: string | null;
  tableName: string;

  onClose: () => void;
}

// Define proper types for order items
interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  billSummary,
  tableId,
  tableName,
  onClose,
}) => {
  if (!isOpen || !billSummary) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">บิลค่าอาหาร</h2>
                <p className="text-green-100"> {tableName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-6 space-y-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              วันที่: {new Date().toLocaleDateString("th-TH")}
            </p>
            <p className="text-sm text-gray-500">
              เวลา: {new Date().toLocaleTimeString("th-TH")}
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {billSummary.orders.map((order, orderIndex) => (
              <BillOrderCard
                key={order.id}
                order={order}
                orderIndex={orderIndex}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">จำนวนออเดอร์:</span>
                <span className="font-medium">
                  {billSummary.orders.length} ออเดอร์
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">จำนวนรายการ:</span>
                <span className="font-medium">
                  {billSummary.itemsCount} รายการ
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-green-200">
                <span className="text-gray-800">ยอดรวมทั้งหมด:</span>
                <span className="text-green-600">
                  ฿{billSummary.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-gray-300"
            >
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BillOrderCardProps {
  order: Order;
  orderIndex: number;
}

const BillOrderCard: React.FC<BillOrderCardProps> = ({ order, orderIndex }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            {orderIndex + 1}
          </span>
          ออเดอร์ #{order.id.slice(-8)}
        </h3>
        <span className="text-sm text-gray-500">
          {new Date(order.orderTime).toLocaleTimeString("th-TH")}
        </span>
      </div>

      <div className="space-y-2">
        {order.items.map((item: OrderItem, itemIndex: number) => (
          <div
            key={itemIndex}
            className="flex justify-between items-center py-2 px-3 bg-white rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.menuItem.name}</p>
              <p className="text-sm text-gray-500">
                ฿{item.menuItem.price.toLocaleString()} × {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                ฿{(item.menuItem.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center font-semibold">
            <span>รวมออเดอร์นี้:</span>
            <span className="text-green-600">
              ฿{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
