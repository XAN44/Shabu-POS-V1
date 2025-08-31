// ReportsPage.tsx
"use client";

import React, { Suspense } from "react";
import { usePOSData } from "@/src/hooks/usePOSData";
import { getAverageWaitTime } from "@/src/app/utils/averageWaitTime";
import {
  LoadingScreen,
  MinimalLoadingScreen,
} from "../../components/Dashboard/LoadingScreen";
import { DashboardStats } from "../../components/Dashboard/DashboardStats";
import ErrorBoundary from "../../components/ErrorBoundary";

const ReportsPage: React.FC = () => {
  const {
    todayStats,
    tableStats,
    todayOrders,
    initialLoading,
    error,
    hasDataLoaded,
  } = usePOSData();

  const averageWaitTime = getAverageWaitTime(todayOrders || []);

  // Show loading screen during initial load
  if (initialLoading || !hasDataLoaded) {
    return <LoadingScreen message="กำลังโหลดข้อมูลรายงาน..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            ไม่สามารถโหลดข้อมูลรายงานได้
          </h1>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  รายงานและสถิติ
                </h1>
                <p className="text-gray-600 mt-1">
                  ดูข้อมูลสถิติและรายงานการดำเนินงาน
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">เวลาเฉลี่ย</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {averageWaitTime || 0} นาที
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <Suspense
            fallback={<MinimalLoadingScreen message="กำลังโหลดสถิติ..." />}
          >
            <DashboardStats
              todayStats={
                todayStats || {
                  completedOrders: 0,
                  totalOrders: 0,
                  newOrders: 0,
                  preparingOrders: 0,
                  readyOrders: 0,
                  servedOrders: 0,
                  inProgressOrders: 0,
                  totalRevenue: 0,
                  todayRevenue: 0,
                }
              }
              tableStats={
                tableStats || {
                  availableTables: 0,
                  occupiedTables: 0,
                  reservedTables: 0,
                  available: 0,
                  occupied: 0,
                  reserved: 0,
                  needsCheckout: 0,
                }
              }
              averageWaitTime={averageWaitTime || 0}
            />
          </Suspense>

          {/* Additional Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                สรุปประจำวัน
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">จำนวนออเดอร์ทั้งหมด</span>
                  <span className="font-semibold text-blue-600">
                    {todayStats?.totalOrders || 0} ออเดอร์
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">รายได้รวม</span>
                  <span className="font-semibold text-green-600">
                    ฿{todayStats?.totalRevenue?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-600">ออเดอร์เสร็จสิ้น</span>
                  <span className="font-semibold text-orange-600">
                    {todayStats?.completedOrders || 0} ออเดอร์
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">ออเดอร์กำลังดำเนินการ</span>
                  <span className="font-semibold text-yellow-600">
                    {todayStats?.inProgressOrders || 0} ออเดอร์
                  </span>
                </div>
              </div>
            </div>

            {/* Table Status Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                สถานะโต๊ะ
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">โต๊ะว่าง</span>
                  <span className="font-semibold text-green-600">
                    {tableStats?.available || 0} โต๊ะ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">โต๊ะมีลูกค้า</span>
                  <span className="font-semibold text-blue-600">
                    {tableStats?.occupied || 0} โต๊ะ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">โต๊ะจอง</span>
                  <span className="font-semibold text-yellow-600">
                    {tableStats?.reserved || 0} โต๊ะ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">โต๊ะรอเช็คเอาท์</span>
                  <span className="font-semibold text-red-600">
                    {tableStats?.needsCheckout || 0} โต๊ะ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ตัวชี้วัดประสิทธิภาพ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                <div className="text-2xl font-bold">{averageWaitTime || 0}</div>
                <div className="text-sm opacity-90">เวลาเฉลี่ย (นาที)</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
                <div className="text-2xl font-bold">
                  {todayStats && todayStats.totalOrders > 0
                    ? (
                        (todayStats.completedOrders / todayStats.totalOrders) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
                <div className="text-sm opacity-90">อัตราความสำเร็จ</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                <div className="text-2xl font-bold">
                  ฿
                  {todayStats && todayStats.totalOrders > 0
                    ? Math.round(
                        (todayStats.totalRevenue || 0) / todayStats.totalOrders
                      ).toLocaleString()
                    : "0"}
                </div>
                <div className="text-sm opacity-90">มูลค่าเฉลี่ย/ออเดอร์</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ReportsPage;
