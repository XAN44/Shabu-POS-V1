"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// กำหนด type สำหรับข้อมูล
interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

interface OrderItemAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addon?: MenuAddon;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItemName?: string;
  menuItem?: MenuItem;
  addons: OrderItemAddon[];
}

interface Order {
  id: string;
  totalAmount: number;
  orderTime: string;
  items: OrderItem[];
}

interface Table {
  id: string;
  number: string;
}

interface Bill {
  id: string;
  totalAmount: number;
  paymentTime: string;
  paymentMethod?: string;
  table?: Table;
  orders: Order[];
}

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const billId = searchParams.get("billId");

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) return;

    fetch(`/api/bills/${billId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch bill");
        }
        return res.json();
      })
      .then((data) => {
        setBill(data);
        setLoading(false);

        // auto print หลังจากโหลดเสร็จ
        setTimeout(() => window.print(), 500);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [billId]);

  if (loading) return <div className="p-6 text-center">กำลังโหลด...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  if (!bill) return <div className="p-6 text-center">ไม่พบใบเสร็จ</div>;

  // คำนวณรายการทั้งหมด
  const allItems = bill.orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderTime: order.orderTime,
    }))
  );

  return (
    <div className="receipt p-4 text-sm w-80 mx-auto bg-white print:w-full print:max-w-none font-mono">
      {/* Header */}
      <div className="text-center border-b-2 border-double pb-3 mb-4">
        <h1 className="text-xl font-bold mb-1">ร้านอาหาร ABC</h1>
        <p className="text-xs text-gray-600">Restaurant ABC</p>
        <div className="mt-2 text-xs">
          <p>123 ถนนสุขุมวิท กรุงเทพฯ 10110</p>
          <p>Tel: 02-123-4567</p>
        </div>
      </div>

      {/* ข้อมูลบิล */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div>
            <span className="font-semibold">เลขที่บิล:</span>
            <br />
            <span className="font-mono">#{bill.id.slice(-8)}</span>
          </div>
          {bill.table && (
            <div>
              <span className="font-semibold">โต๊ะ:</span>
              <br />
              <span className="text-lg font-bold">{bill.table.number}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-semibold">วันที่:</span>
            <br />
            <span>
              {new Date(bill.paymentTime).toLocaleDateString("th-TH")}
            </span>
          </div>
          <div>
            <span className="font-semibold">เวลา:</span>
            <br />
            <span>
              {new Date(bill.paymentTime).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {bill.paymentMethod && (
          <div className="mt-2 text-xs">
            <span className="font-semibold">วิธีชำระ: </span>
            <span className="bg-gray-100 px-2 py-1 rounded">
              {bill.paymentMethod}
            </span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-double pt-2 mb-2"></div>

      {/* รายการสินค้า */}
      <div className="mb-4">
        <div className="text-center text-xs font-bold mb-3 border-b border-gray-300 pb-1">
          รายการอาหาร / ITEMS
        </div>

        {allItems.map((item, index) => {
          // คำนวณราคาต่อหน่วยของเมนูหลัก
          const menuUnitPrice =
            item.menuItem?.price || item.price / item.quantity;

          // คำนวณราคารวมของ addons
          const addonsTotal = item.addons.reduce(
            (sum, addon) => sum + addon.price * addon.quantity,
            0
          );

          // ราคารวมของรายการนี้ (เมนูหลัก + addons)
          const itemTotal = menuUnitPrice * item.quantity + addonsTotal;

          return (
            <div key={index} className="mb-4 pb-3 border-b border-dotted">
              {/* หัวรายการ */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-sm leading-tight">
                    {index + 1}.{" "}
                    {item.menuItemName || item.menuItem?.name || "ไม่ระบุ"}
                  </h3>
                </div>
                <div className="text-right ml-2">
                  <div className="text-xs text-gray-600">จำนวน</div>
                  <div className="font-bold text-sm">{item.quantity}</div>
                </div>
              </div>

              {/* รายละเอียดราคา */}
              <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span>ราคาต่อหน่วย:</span>
                  <span className="font-mono">
                    ฿{menuUnitPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>จำนวน:</span>
                  <span className="font-mono">{item.quantity} รายการ</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span className="font-semibold">รวมเมนูหลัก:</span>
                  <span className="font-bold font-mono">
                    ฿{(menuUnitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Add-ons */}
              {item.addons && item.addons.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1 font-semibold">
                    เพิ่มเติม:
                  </div>
                  {item.addons.map((addon, addonIndex) => (
                    <div
                      key={addonIndex}
                      className="bg-blue-50 p-2 rounded mb-1"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="text-xs font-medium">
                            • {addon.name}
                          </span>
                        </div>
                        <div className="text-xs text-right ml-2">
                          <div>จำนวน: {addon.quantity}</div>
                          <div>
                            ฿{addon.price.toLocaleString()} × {addon.quantity}
                          </div>
                          <div className="font-bold">
                            = ฿{(addon.price * addon.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* รวม addons */}
                  {addonsTotal > 0 && (
                    <div className="bg-blue-100 p-2 rounded mt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>รวมเพิ่มเติม:</span>
                        <span className="font-mono">
                          ฿{addonsTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* รวมรายการนี้ทั้งหมด */}
              <div className="bg-green-50 border border-green-200 p-2 rounded mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>รวมรายการนี้ทั้งหมด:</span>
                  <span className="font-mono text-green-700">
                    ฿{itemTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-double pt-2 mb-2"></div>

      {/* สรุปยอด */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-sm">
          <span>จำนวนรายการทั้งหมด:</span>
          <span className="font-mono">
            {allItems.reduce((sum, item) => sum + item.quantity, 0)} รายการ
          </span>
        </div>

        <div className="border-t border-dashed pt-2">
          <div className="flex justify-between text-lg font-bold bg-gray-100 p-2 rounded">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="font-mono">
              ฿{bill.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-double pt-3"></div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 space-y-2">
        <div className="border border-gray-300 rounded p-2">
          <p className="font-semibold">ขอบคุณที่ใช้บริการ</p>
          <p>Thank you for your business</p>
          <p className="mt-1 text-gray-500">กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน</p>
        </div>

        <div className="pt-2 border-t border-dotted text-gray-400">
          <p>พิมพ์เมื่อ: {new Date().toLocaleString("th-TH")}</p>
          <p className="text-xs">System ID: {bill.id}</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .receipt {
            margin: 0;
            padding: 8px;
            width: 100% !important;
            max-width: 58mm;
            font-size: 9px;
            line-height: 1.2;
          }

          body {
            margin: 0;
            padding: 0;
          }

          @page {
            margin: 0;
            size: 58mm auto;
          }

          .text-right {
            text-align: right !important;
          }

          .text-center {
            text-align: center !important;
          }

          .bg-gray-100,
          .bg-gray-50 {
            background-color: #f5f5f5 !important;
          }

          .bg-blue-50 {
            background-color: #eff6ff !important;
          }

          .bg-blue-100 {
            background-color: #dbeafe !important;
          }

          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }

          .border-green-200 {
            border-color: #bbf7d0 !important;
          }

          .border-double {
            border-style: double !important;
          }

          .border-dotted {
            border-style: dotted !important;
          }

          .border-dashed {
            border-style: dashed !important;
          }

          .text-green-700 {
            color: #15803d !important;
          }
        }
      `}</style>
    </div>
  );
}
