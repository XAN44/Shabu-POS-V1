"use client";

import React, { useEffect, useState } from "react";
import { TableStatus } from "./TableStatus";
import { QRCodeDialog } from "./QRCodeDialog";
import { AddEditTableDialog } from "./AddEditTableDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/src/app/types/Order";

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
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: parseInt(formData.number),
        seats: parseInt(formData.seats),
      }),
    });
    const newTable = await res.json();
    setTables([...tables, newTable]);
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
        number: parseInt(formData.number),
        seats: parseInt(formData.seats),
      }),
    });
    const updated = await res.json();
    setTables(tables.map((t) => (t.id === updated.id ? updated : t)));
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการโต๊ะ</h1>
        <p className="text-gray-600">
          จัดการโต๊ะและสร้าง QR Code สำหรับลูกค้าสั่งอาหาร
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["ทั้งหมด", "ว่าง", "มีลูกค้า", "จอง", "ทำความสะอาด"].map(
          (label, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {Object.values(tableStats)[i]}
                </div>
                <div className="text-xs text-gray-600">{label}</div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">รายการโต๊ะ</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มโต๊ะใหม่
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, index) => (
          <TableStatus
            key={index}
            table={table}
            onStatusChange={handleTableStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShowQR={handleShowQR}
          />
        ))}
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
