"use client";

import React from "react";
import { LoadingScreen } from "../../components/Dashboard/LoadingScreen";
import { MenuManagement } from "../../components/menu/MenuManagement";
import { usePOSData } from "@/src/hooks/usePOSData";

const MenuManagementPage: React.FC = () => {
  const {
    menuItems,
    initialLoading,
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
  } = usePOSData();

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการเมนู</h1>
              <p className="text-gray-600 mt-1">
                เพิ่ม แก้ไข หรือลบเมนูอาหารในร้าน
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">จำนวนเมนู</p>
              <p className="text-2xl font-bold text-orange-600">
                {menuItems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Management Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <MenuManagement
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onEditMenuItem={handleEditMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuManagementPage;
