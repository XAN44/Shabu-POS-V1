// components/bills/BillOverview.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  Award,
  Target,
  CreditCard,
  BarChart3,
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-70 rounded-3xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-blue-200/50 shadow-2xl p-12">
          <div className="flex justify-center items-center">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                  กำลังโหลดข้อมูลบิล
                </h3>
                <p className="text-blue-600 font-medium">กรุณารอสักครู่...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-70 rounded-3xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-red-200/50 shadow-2xl p-12">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Receipt className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-pink-800 bg-clip-text text-transparent mb-2">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <Button
                onClick={fetchBills}
                className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ลองใหม่
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Summary Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 opacity-90 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-3xl"></div>

        <div className="relative p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  ภาพรวมบิลการขาย
                </h2>
                <p className="text-green-100 text-lg font-medium">
                  ระบบติดตามรายได้แบบเรียลไทม์
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={fetchBills}
                disabled={loading}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                รีเฟรช
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  ฿{todayStats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  รายได้วันนี้
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Total Bills */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                  {todayStats.totalBills > 0 && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {todayStats.totalBills}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  บิลวันนี้
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </div>
            </div>

            {/* Average Bill */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-500 animate-bounce" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  ฿{Math.round(todayStats.averageBillAmount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  ค่าเฉลี่ย/บิล
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            </div>

            {/* Last Bill Time */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  {todayStats.lastBillTime && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                  )}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
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
                <div className="text-sm text-gray-600 font-semibold">
                  บิลล่าสุด
                </div>
                <div className="mt-3 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 opacity-70 rounded-3xl"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-gray-800 bg-clip-text text-transparent">
                  บิลวันนี้ ({todayBills.length})
                </h3>
                <p className="text-slate-600 font-medium">
                  รายการบิลที่ชำระแล้ววันนี้
                </p>
              </div>
            </div>
          </div>

          {todayBills.length === 0 ? (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 opacity-60 rounded-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-16 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Receipt className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
                  ยังไม่มีบิลวันนี้
                </h3>
                <p className="text-lg text-gray-500 font-medium">
                  เริ่มต้นการขายและรับชำระเงินกันเลย
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBills
                .sort(
                  (a, b) =>
                    new Date(b.paymentTime).getTime() -
                    new Date(a.paymentTime).getTime()
                )
                .map((bill) => (
                  <div key={bill.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-105"></div>

                    <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white/90 backdrop-blur-xl rounded-2xl border border-green-200/50 shadow-xl">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-2xl"></div>

                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded-xl border-0 shadow-lg animate-pulse">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                จ่ายแล้ว
                              </Badge>
                              <div className="px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full text-xs text-gray-500 font-mono">
                                #{bill.id.slice(-8)}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-lg">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium">
                                  {new Date(
                                    bill.paymentTime
                                  ).toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl flex items-center justify-center shadow-lg">
                                  <Target className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="font-medium">
                                  โต๊ะ {bill.table.number}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-200 rounded-xl flex items-center justify-center shadow-lg">
                                  <Receipt className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="font-medium">
                                  {bill.orderIds.length} ออเดอร์
                                </span>
                              </div>
                            </div>

                            {bill.paymentMethod && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl border-0 shadow-lg w-fit">
                                <CreditCard className="w-3 h-3 mr-1" />
                                {bill.paymentMethod}
                              </Badge>
                            )}
                          </div>

                          <div className="text-right space-y-4">
                            <div className="relative">
                              <div className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                                ฿{bill.totalAmount.toLocaleString()}
                              </div>
                              <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewBillDetails(bill)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePrintBill(bill)}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
