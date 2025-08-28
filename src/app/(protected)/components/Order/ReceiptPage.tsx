"use client";
import { Order } from "@/src/app/types/Order";
import React, { useEffect } from "react";

interface Props {
  order: Order;
}

export default function ReceiptPage({ order }: Props) {
  useEffect(() => {
    // auto print เมื่อเปิดหน้านี้
    window.print();
  }, []);

  return (
    <div className="p-4 text-sm">
      <h2 className="text-center font-bold mb-2">🍲 Shabu POS</h2>
      <div className="text-center text-xs mb-4">ใบเสร็จอย่างย่อ</div>

      <div className="border-t border-b py-2 my-2">
        โต๊ะ: {order.table.number}
      </div>

      <div>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>
              {item.menuItem.available} x{item.quantity}
            </span>
            <span>฿{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="border-t mt-2 pt-2 flex justify-between font-bold">
        <span>รวมทั้งหมด</span>
        <span>฿{order.totalAmount}</span>
      </div>

      <p className="mt-4 text-center text-xs">ขอบคุณที่ใช้บริการ ❤️</p>

      <button
        onClick={() => window.print()}
        className="no-print mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        พิมพ์อีกครั้ง
      </button>
    </div>
  );
}
