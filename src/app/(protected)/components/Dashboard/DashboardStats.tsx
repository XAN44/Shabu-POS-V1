import React from "react";
import {
  TrendingUp,
  Clock,
  Menu,
  CheckCircle,
  ShoppingCart,
  Table as TableIcon,
  Users,
  ArrowUp,
  Bell,
  Timer,
  Zap,
} from "lucide-react";
import { POSStats, TableStats } from "@/src/hooks/usePOSData";

interface DashboardStatsProps {
  todayStats: POSStats;
  tableStats: TableStats;
  averageWaitTime: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  todayStats,
  tableStats,
  averageWaitTime,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      {/* Revenue */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-6 h-6 opacity-90" />
          <ArrowUp className="w-4 h-4 opacity-75" />
        </div>
        <div className="text-2xl font-bold mb-1">
          ฿{todayStats.todayRevenue.toLocaleString()}
        </div>
        <div className="text-xs opacity-90 font-medium">ยอดขายวันนี้</div>
      </div>

      {/* New Orders */}
      <div
        className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
          todayStats.newOrders > 0
            ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
            : "bg-gradient-to-br from-gray-400 to-gray-500"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-6 h-6 opacity-90" />
          {todayStats.newOrders > 0 && (
            <Bell className="w-4 h-4 opacity-75 animate-bounce" />
          )}
        </div>
        <div className="text-2xl font-bold mb-1">{todayStats.newOrders}</div>
        <div className="text-xs opacity-90 font-medium">ออเดอร์ใหม่</div>
      </div>

      {/* Preparing Orders */}
      <div
        className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
          todayStats.preparingOrders > 0
            ? "bg-gradient-to-br from-orange-500 to-orange-600"
            : "bg-gradient-to-br from-gray-400 to-gray-500"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Menu className="w-6 h-6 opacity-90" />
          {todayStats.preparingOrders > 0 && (
            <Timer className="w-4 h-4 opacity-75" />
          )}
        </div>
        <div className="text-2xl font-bold mb-1">
          {todayStats.preparingOrders}
        </div>
        <div className="text-xs opacity-90 font-medium">กำลังทำ</div>
      </div>

      {/* Ready Orders */}
      <div
        className={`rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
          todayStats.readyOrders > 0
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : "bg-gradient-to-br from-gray-400 to-gray-500"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="w-6 h-6 opacity-90" />
          {todayStats.readyOrders > 0 && <Zap className="w-4 h-4 opacity-75" />}
        </div>
        <div className="text-2xl font-bold mb-1">{todayStats.readyOrders}</div>
        <div className="text-xs opacity-90 font-medium">พร้อมเสิร์ฟ</div>
      </div>

      {/* Total Orders */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <ShoppingCart className="w-6 h-6 opacity-90 mb-2" />
        <div className="text-2xl font-bold mb-1">{todayStats.totalOrders}</div>
        <div className="text-xs opacity-90 font-medium">ออเดอร์วันนี้</div>
      </div>

      {/* Available Tables */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <TableIcon className="w-6 h-6 opacity-90 mb-2" />
        <div className="text-2xl font-bold mb-1">
          {tableStats.availableTables}
        </div>
        <div className="text-xs opacity-90 font-medium">โต๊ะว่าง</div>
      </div>

      {/* Occupied Tables */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <Users className="w-6 h-6 opacity-90 mb-2" />
        <div className="text-2xl font-bold mb-1">
          {tableStats.occupiedTables}
        </div>
        <div className="text-xs opacity-90 font-medium">โต๊ะมีลูกค้า</div>
      </div>

      {/* Average Wait Time */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
        <Clock className="w-6 h-6 opacity-90 mb-2" />
        <div className="text-2xl font-bold mb-1">{averageWaitTime}</div>
        <div className="text-xs opacity-90 font-medium">นาทีเฉลี่ย</div>
      </div>
    </div>
  );
};
