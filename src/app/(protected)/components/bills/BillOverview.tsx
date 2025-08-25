// components/bills/BillOverview.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

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

interface BillOverviewProps {
  refreshInterval?: number;
}

export const BillOverview: React.FC<BillOverviewProps> = ({
  refreshInterval = 30000, // รีเฟรชทุก 30 วินาที
}) => {
  const [, setBills] = useState<Bill[]>([]);
  const [todayBills, setTodayBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSelectedBill] = useState<Bill | null>(null);
  const [, setIsDetailModalOpen] = useState(false);

  const fetchBills = async () => {
    try {
      setError(null);
      const response = await fetch("/api/bills");

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลบิลได้");
      }

      const data = await response.json();
      setBills(data);

      // กรองบิลวันนี้
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBillsData = data.filter((bill: Bill) => {
        const billDate = new Date(bill.paymentTime);
        return billDate >= today && billDate < tomorrow;
      });

      setTodayBills(todayBillsData);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      toast.error("ไม่สามารถดึงข้อมูลบิลได้");
    } finally {
      setLoading(false);
    }
  };

  // เรียกข้อมูลครั้งแรก
  useEffect(() => {
    fetchBills();
  }, []);

  // รีเฟรชข้อมูลอัตโนมัติ
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchBills, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // คำนวณสถิติ
  const todayStats = {
    totalBills: todayBills.length,
    totalRevenue: todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    averageBillAmount:
      todayBills.length > 0
        ? todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0) /
          todayBills.length
        : 0,
    lastBillTime:
      todayBills.length > 0
        ? Math.max(
            ...todayBills.map((bill) => new Date(bill.paymentTime).getTime())
          )
        : null,
  };

  const handleViewBillDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setIsDetailModalOpen(true);
  };

  const handlePrintBill = (bill: Bill) => {
    // TODO: ใช้งานเครื่องพิมพ์หรือสร้าง PDF
    toast.success(`พิมพ์บิล ${bill.id.slice(-8)}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-gray-600">กำลังโหลดข้อมูลบิล...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Receipt className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBills}
              className="mt-2"
            >
              ลองใหม่
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* สถิติวันนี้ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              ฿{todayStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">รายได้วันนี้</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <Receipt className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{todayStats.totalBills}</div>
            <div className="text-sm opacity-90">บิลวันนี้</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              ฿{Math.round(todayStats.averageBillAmount).toLocaleString()}
            </div>
            <div className="text-sm opacity-90">ค่าเฉลี่ย/บิล</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <div className="text-lg font-bold">
              {todayStats.lastBillTime
                ? new Date(todayStats.lastBillTime).toLocaleTimeString(
                    "th-TH",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "ยังไม่มี"}
            </div>
            <div className="text-sm text-gray-600">บิลล่าสุด</div>
          </CardContent>
        </Card>
      </div>

      {/* รายการบิลวันนี้ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            บิลวันนี้ ({todayBills.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBills}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {todayBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีบิลวันนี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBills
                .sort(
                  (a, b) =>
                    new Date(b.paymentTime).getTime() -
                    new Date(a.paymentTime).getTime()
                )
                .map((bill) => (
                  <Card
                    key={bill.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              จ่ายแล้ว
                            </Badge>
                            <span className="font-mono text-sm text-gray-600">
                              #{bill.id.slice(-8)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(bill.paymentTime).toLocaleTimeString(
                                "th-TH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </span>
                            <span>โต๊ะ {bill.table.number}</span>
                            <span>{bill.orderIds.length} ออเดอร์</span>
                          </div>

                          {bill.paymentMethod && (
                            <Badge variant="secondary" className="w-fit">
                              {bill.paymentMethod}
                            </Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            ฿{bill.totalAmount.toLocaleString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBillDetails(bill)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintBill(bill)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
