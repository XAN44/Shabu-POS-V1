// BillsOverviewPage.tsx
"use client";

import React, { Suspense } from "react";
import {
  LoadingScreen,
  MinimalLoadingScreen,
} from "../../components/Dashboard/LoadingScreen";
import { usePOSData } from "@/src/hooks/usePOSData";
import { BillOverview } from "../../components/bills/BillOverview";
import ErrorBoundary from "../../components/ErrorBoundary";

const BillsOverviewPage: React.FC = () => {
  const { todayStats, initialLoading, error, hasDataLoaded } = usePOSData();

  // Show loading screen during initial load
  if (initialLoading || !hasDataLoaded) {
    return <LoadingScreen message="กำลังโหลดข้อมูลบิลและรายได้..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            ไม่สามารถโหลดข้อมูลบิลได้
          </h1>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">บิล/รายได้</h1>
                <p className="text-gray-600 mt-1">ดูสถิติรายได้และบิลต่างๆ</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">รายได้วันนี้</p>
                <p className="text-2xl font-bold text-green-600">
                  ฿{todayStats?.todayRevenue?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    ออเดอร์วันนี้
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {todayStats?.totalOrders || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    ออเดอร์ใหม่
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {todayStats?.newOrders || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xs">🆕</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เสร็จแล้ว</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayStats?.newOrders || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    รายได้เฉลี่ย
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    ฿
                    {todayStats && todayStats.totalOrders > 0
                      ? Math.round(
                          (todayStats.totalOrders || 0) / todayStats.totalOrders
                        ).toLocaleString()
                      : "0"}
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xs">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bills Overview Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <Suspense
              fallback={
                <MinimalLoadingScreen message="กำลังโหลดข้อมูลบิล..." />
              }
            >
              <BillOverview />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BillsOverviewPage;
