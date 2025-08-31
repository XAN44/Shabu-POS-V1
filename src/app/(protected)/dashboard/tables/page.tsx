"use client";

import React from "react";
import { TableManagement } from "../../components/tables/TableManagement";

const TableManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการโต๊ะ</h1>
              <p className="text-gray-600 mt-1">จัดการสถานะโต๊ะและการจองโต๊ะ</p>
            </div>
          </div>
        </div>

        {/* Table Management Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <TableManagement />
        </div>
      </div>
    </div>
  );
};

export default TableManagementPage;
