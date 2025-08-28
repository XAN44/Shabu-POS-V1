"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  menuItem: { name: string; price?: number };
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  tableId: string;
  table: { number: string };
  items: OrderItem[];
  totalAmount: number;
  orderTime: string;
  notes?: string;
  status?: string;
}

interface Bill {
  id: string;
  tableId?: string;
  table?: { number: string };
  totalAmount: number;
  paymentMethod?: string;
  paymentTime: string;
  orders: Order[];
  orderIds?: string[];
}

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const billId = searchParams.get("billId");

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) {
      setError("ไม่พบ Bill ID");
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching bill with ID:", billId);

    // เปลี่ยนจาก query parameter เป็น dynamic route
    fetch(`/api/bills/${billId}`)
      .then(async (res) => {
        console.log("📡 Response status:", res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("📄 Raw API response:", data);

        // ตรวจสอบว่าข้อมูลเป็น array หรือ object
        const billData = Array.isArray(data) ? data[0] : data;

        setBill(billData);
        setLoading(false);

        // auto print หลังจากโหลดเสร็จ (เพิ่มเวลารอเพื่อให้ render เสร็จ)
        setTimeout(() => {
          console.log("🖨️ Triggering print...");
          window.print();
        }, 1000);
      })
      .catch((err) => {
        console.error("❌ Error fetching bill:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [billId]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        กำลังโหลดใบเสร็จ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <div className="mb-2">⚠️ เกิดข้อผิดพลาด</div>
        <div className="text-sm">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6 text-center">
        <div className="mb-2">📄 ไม่พบข้อมูลใบเสร็จ</div>
        <div className="text-sm text-gray-500">Bill ID: {billId}</div>
      </div>
    );
  }

  // คำนวณยอดรวมจาก orders หาก totalAmount ไม่ถูกต้อง
  const calculatedTotal =
    bill.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const displayTotal = bill.totalAmount || calculatedTotal;

  return (
    <div className="receipt p-4 text-sm w-80 mx-auto bg-white">
      {/* Header */}
      <div className="text-center border-b-2 border-dashed pb-2 mb-4">
        <h2 className="font-bold text-lg">🍲 Shabu POS</h2>
        <p className="text-xs">ใบเสร็จรับเงิน</p>
      </div>

      {/* Bill Info */}
      <div className="mb-4 text-xs space-y-1">
        <div className="flex justify-between">
          <span>โต๊ะ:</span>
          <span>{bill.table?.number || bill.tableId || "ไม่ระบุ"}</span>
        </div>
        <div className="flex justify-between">
          <span>เวลา:</span>
          <span>
            {bill.paymentTime
              ? new Date(bill.paymentTime).toLocaleString("th-TH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "ไม่ระบุเวลา"}
          </span>
        </div>
        {bill.paymentMethod && (
          <div className="flex justify-between">
            <span>วิธีชำระเงิน:</span>
            <span>{bill.paymentMethod}</span>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="border-t border-b border-dashed py-2 my-2">
        {bill.orders && bill.orders.length > 0 ? (
          bill.orders.map((order, orderIndex) => (
            <div key={order.id} className="mb-3">
              <div className="text-xs font-semibold mb-2 text-gray-600 border-b border-gray-200 pb-1">
                Order #{orderIndex + 1} (ID: {order.id})
                {order.orderTime && (
                  <div className="font-normal text-gray-500">
                    {new Date(order.orderTime).toLocaleString("th-TH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <div className="flex-1">
                        <div>{item.menuItem?.name || "ไม่ระบุชื่อ"}</div>
                        <div className="text-gray-500">
                          ฿{item.price.toLocaleString()} x {item.quantity}
                        </div>
                        {item.notes && (
                          <div className="text-gray-400 italic text-xs">
                            หมายเหตุ: {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right font-medium">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  ไม่มี items ในออเดอร์นี้
                </div>
              )}

              {order.totalAmount > 0 && (
                <div className="text-xs text-right mt-1 pt-1 border-t border-gray-200">
                  รวม: ฿{order.totalAmount.toLocaleString()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-xs text-gray-500 py-4">
            <div>⚠️ ไม่มีรายการสั่งซื้อ</div>
            {bill.orderIds && bill.orderIds.length > 0 && (
              <div className="mt-2 text-xs">
                Order IDs ที่ไม่พบ: {bill.orderIds.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-dashed pt-2 space-y-1">
        <div className="flex justify-between font-bold text-base">
          <span>รวมทั้งหมด</span>
          <span>฿{displayTotal.toLocaleString()}</span>
        </div>

        {bill.totalAmount !== calculatedTotal && calculatedTotal > 0 && (
          <div className="text-xs text-gray-500">
            (คำนวณจากออเดอร์: ฿{calculatedTotal.toLocaleString()})
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-dashed">
        <p className="text-xs">ขอบคุณที่ใช้บริการ ❤️</p>
        <p className="text-xs text-gray-500 mt-1">
          พิมพ์เมื่อ: {new Date().toLocaleString("th-TH")}
        </p>
      </div>
    </div>
  );
}
