import React from "react";
import {
  Activity,
  Calendar,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Bell,
  Phone,
  Zap,
} from "lucide-react";

interface DashboardHeaderProps {
  lastRefresh: Date;
  isConnected: boolean;
  isRefreshing: boolean;
  newOrdersCount: number;
  staffCallCount: number;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  fetchDataRef: React.RefObject<Promise<void> | null>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastRefresh,
  isConnected,
  isRefreshing,
  newOrdersCount,
  staffCallCount,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  fetchDataRef,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ระบบจุดขาย (POS)
              </h1>
              <p className="text-sm text-gray-500">
                Professional Point of Sale System
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              <span className="font-medium text-gray-700">
                {new Date().toLocaleDateString("th-TH")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700">
                {lastRefresh.toLocaleTimeString("th-TH")}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                isConnected
                  ? "bg-green-50 text-green-700 shadow-green-100 shadow-sm"
                  : "bg-red-50 text-red-700 shadow-red-100 shadow-sm"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">
                {isConnected ? "เชื่อมต่อแล้ว" : "ไม่เชื่อมต่อ"}
              </span>
              {isConnected && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>

            {isRefreshing && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="font-medium">กำลังซิงค์...</span>
              </div>
            )}

            {staffCallCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full animate-pulse">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {staffCallCount} โต๊ะรอเช็คบิล
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onToggleAutoRefresh}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
              autoRefresh
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200 hover:shadow-green-300 hover:from-green-600 hover:to-green-700"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <Zap
              className={`w-4 h-4 ${
                autoRefresh ? "text-white" : "text-gray-500"
              }`}
            />
            <span className="text-sm">
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing || !!fetchDataRef.current}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing || fetchDataRef.current ? "animate-spin" : ""
              }`}
            />
            <span className="text-sm">รีเฟรช</span>
          </button>

          {newOrdersCount > 0 && (
            <div className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium animate-pulse shadow-sm shadow-red-200">
              <Bell className="w-4 h-4 mr-2" />
              <span className="text-sm">{newOrdersCount} ออเดอร์ใหม่</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
