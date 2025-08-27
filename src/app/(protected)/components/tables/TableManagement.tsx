"use client";

import React, { useEffect, useState } from "react";
import { TableStatus } from "./TableStatus";
import { QRCodeDialog } from "./QRCodeDialog";
import { AddEditTableDialog } from "./AddEditTableDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Grid3x3,
  Users,
  QrCode,
  Settings,
  Sparkles,
  Crown,
  Target,
  Activity,
  Award,
  ArrowUp,
  TrendingUp,
  CheckCircle,
  Clock,
  Timer,
} from "lucide-react";
import { Table } from "@/src/app/types/Order";
import { toast } from "sonner";

export const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);

  const [formData, setFormData] = useState({ number: "", seats: "" });
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(
    null
  );

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  const fetchTables = async () => {
    const res = await fetch("/api/tables");
    const data = await res.json();
    setTables(data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async () => {
    const number = formData.number;
    const isDuplicate = tables.some(
      (t) => String(t.number) === formData.number
    );
    if (isDuplicate) {
      toast.error("ไม่สามารถเพิ่มโต๊ะได้", {
        description: `เลขโต๊ะ ${number} มีอยู่แล้ว`,
      });
      return;
    }

    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: formData.number,
        seats: parseInt(formData.seats),
      }),
    });

    const newTable = await res.json();
    setTables([...tables, newTable]);
    setShowAddDialog(false);
  };

  const handleEdit = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number.toString(),
        seats: table.seats.toString(),
      });
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTable) return;
    const res = await fetch(`/api/tables/${editingTable.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: formData.number,
        seats: parseInt(formData.seats),
      }),
    });
    const updated = await res.json();
    setTables(tables.map((t) => (t.id === updated.id ? updated : t)));
    setShowEditDialog(false);
  };

  const handleDelete = (tableId: string) => {
    setDeletingTableId(tableId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingTableId) return;
    await fetch(`/api/tables/${deletingTableId}`, { method: "DELETE" });
    setTables(tables.filter((t) => t.id !== deletingTableId));
  };

  const handleShowQR = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setSelectedTableForQR(table);
      setShowQRDialog(true);
    }
  };

  const handleTableStatusChange = async (tableId: string, status: string) => {
    const res = await fetch(`/api/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setTables(tables.map((t) => (t.id === updated.id ? updated : t)));
  };

  const tableStats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  const occupancyRate =
    tables.length > 0
      ? ((tableStats.occupied + tableStats.reserved) / tables.length) * 100
      : 0;

  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);

  if (tables.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl p-6 sm:p-8 md:p-12 max-w-lg w-full mx-auto text-center space-y-6">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg relative">
            <Grid3x3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
              ระบบจัดการโต๊ะ
            </h3>
            <p className="text-base sm:text-lg text-gray-500 font-medium">
              ยังไม่มีโต๊ะ เริ่มเพิ่มโต๊ะแรกของคุณ
            </p>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          <Button
            onClick={() => {
              setFormData({ number: "A1", seats: "" });
              setShowAddDialog(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มโต๊ะแรก
          </Button>
        </div>

        {/* Dialog */}
        <AddEditTableDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddTable}
          title="เพิ่มโต๊ะใหม่"
          description="กรอกข้อมูลโต๊ะใหม่ ระบบจะสร้าง ID และ QR Code ให้อัตโนมัติ"
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Header Section - Same size as OrdersOverview */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl p-4 sm:p-6 md:p-8">
        {/* Main Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
                <Grid3x3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                ระบบจัดการโต๊ะ
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium">
                จัดการโต๊ะและ QR Code แบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-4">
            <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/30">
              <div className="text-white/80 text-xs sm:text-sm font-medium">
                จำนวนโต๊ะ
              </div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {tables.length}
              </div>
            </div>

            {totalSeats > 0 && (
              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-green-300/30">
                <div className="text-green-100 text-xs sm:text-sm font-medium">
                  ที่นั่งรวม
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {totalSeats}
                </div>
              </div>
            )}

            <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-purple-300/30">
              <div className="text-purple-100 text-xs sm:text-sm font-medium">
                อัตราใช้งาน
              </div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                {occupancyRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Available Tables */}
          <div
            className={`relative group ${
              tableStats.available > 0 ? "animate-pulse" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    tableStats.available > 0
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {tableStats.available > 0 && (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping delay-500"></div>
                  </div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {tableStats.available}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                ว่าง
              </div>
              {tableStats.available > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Occupied Tables */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    tableStats.occupied > 0
                      ? "bg-gradient-to-br from-red-500 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {tableStats.occupied > 0 && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-spin border-2 border-white"></div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {tableStats.occupied}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                มีลูกค้า
              </div>
              {tableStats.occupied > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Reserved Tables */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    tableStats.reserved > 0
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {tableStats.reserved > 0 && (
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 animate-bounce" />
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {tableStats.reserved}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                จอง
              </div>
              {tableStats.reserved > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Cleaning Tables */}
          <div className="relative group col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${
                    tableStats.cleaning > 0
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Timer className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                {tableStats.cleaning > 0 && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {tableStats.cleaning}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                ทำความสะอาด
              </div>
              {tableStats.cleaning > 0 && (
                <div className="mt-2 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Total Tables */}
          <div className="relative group col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-110"></div>
            <div className="relative bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Grid3x3 className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {tableStats.total}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                ทั้งหมด
              </div>
              <div className="mt-2 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-indigo-200/50 shadow-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <QrCode className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent">
                รายการโต๊ะ
              </h2>
              <p className="text-indigo-600 font-medium text-sm sm:text-base">
                จัดการโต๊ะและสร้าง QR Code
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-bold shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-1 sm:gap-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>เพิ่มโต๊ะใหม่</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
            </div>
          </Button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Target className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-teal-800">
                รายการโต๊ะทั้งหมด
              </h3>
              <p className="text-sm sm:text-base text-teal-600 font-medium">
                จัดการสถานะและ QR Code ของแต่ละโต๊ะ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg text-sm sm:text-base">
              {tables.length} โต๊ะ
            </div>
            {occupancyRate > 0 && (
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg">
                ใช้งาน {occupancyRate.toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tables.map((table, index) => (
            <div
              key={table.id ?? index}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <TableStatus
                table={table}
                onStatusChange={handleTableStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowQR={handleShowQR}
              />
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-teal-200/30">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 rounded-xl sm:rounded-2xl border border-teal-200 shadow-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                จัดการ {tables.length} โต๊ะ
              </span>
            </div>
            {totalSeats > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                  {totalSeats} ที่นั่ง
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddEditTableDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddTable}
        title="เพิ่มโต๊ะใหม่"
        description="กรอกข้อมูลโต๊ะใหม่ ระบบจะสร้าง ID และ QR Code ให้อัตโนมัติ"
      />

      {editingTable && (
        <AddEditTableDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSaveEdit}
          title="แก้ไขโต๊ะ"
          description="แก้ไขข้อมูลโต๊ะ (ID และ QR Code จะไม่เปลี่ยนแปลง)"
        />
      )}

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />

      {selectedTableForQR && (
        <QRCodeDialog
          table={selectedTableForQR}
          open={showQRDialog}
          onClose={() => setShowQRDialog(false)}
        />
      )}
    </div>
  );
};
