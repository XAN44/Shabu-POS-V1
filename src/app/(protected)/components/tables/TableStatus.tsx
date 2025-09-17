import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  QrCode,
  Edit3,
  Trash2,
  Sparkles,
  BrushCleaning,
} from "lucide-react";
import { Table } from "@/src/app/types/Order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TableStatusProps {
  table: Table;
  onStatusChange: (tableId: string, status: string) => void;
  onEdit: (tableId: string) => void;
  onDelete: (tableId: string) => void;
  onShowQR: (tableId: string) => void;
}

export const TableStatus: React.FC<TableStatusProps> = ({
  table,
  onStatusChange,
  onEdit,
  onDelete,
  onShowQR,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "from-emerald-50 via-green-50 to-teal-50";
      case "occupied":
        return "from-red-50 via-pink-50 to-rose-50";
      case "cleaning":
        return "from-gray-50 via-slate-50 to-zinc-50";
      default:
        return "from-gray-50 via-slate-50 to-zinc-50";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg";
      case "occupied":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg";
      case "cleaning":
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg";
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-emerald-200/50";
      case "occupied":
        return "border-red-200/50";
      case "cleaning":
        return "border-gray-200/50";
      default:
        return "border-gray-200/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "ว่าง";
      case "occupied":
        return "มีลูกค้า";
      case "cleaning":
        return "ทำความสะอาด";
      default:
        return status;
    }
  };

  const isActive = table.status === "occupied";

  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(
          table.status
        )} opacity-70 rounded-3xl blur-lg transition-all duration-300 group-hover:blur-xl group-hover:scale-105`}
      ></div>

      <Card
        className={`relative cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/90 backdrop-blur-xl rounded-3xl border ${getCardBorderColor(
          table.status
        )} shadow-xl overflow-hidden ${isActive ? "animate-pulse" : ""}`}
      >
        {/* Status indicator */}
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
        )}

        {/* Sparkles decoration for occupied */}
        {isActive && (
          <div className="absolute top-4 right-4">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
          </div>
        )}

        <CardHeader className="pb-4 relative">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  โต๊ะ {table.number}
                </CardTitle>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {table.seats} ที่นั่ง
                </span>
              </div>

              <div className="px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full text-xs text-gray-500 font-mono inline-block">
                ID: {table.id}
              </div>
            </div>

            <Badge
              className={`${getStatusBadgeColor(
                table.status
              )} text-sm font-bold px-4 py-2 rounded-2xl border-0 animate-pulse`}
            >
              {getStatusText(table.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={() => onShowQR(table.id)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={() => onEdit(table.id)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={() => onDelete(table.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Status change buttons */}
          <div className="space-y-3">
            {table.status === "available" && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 to-red-200/50 rounded-2xl blur-sm"></div>
                <div className="relative grid grid-cols-1 gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    onClick={() => onStatusChange(table.id, "occupied")}
                  >
                    มีลูกค้า
                  </Button>
                </div>
              </div>
            )}

            {table.status === "occupied" && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-emerald-200/50 rounded-2xl blur-sm"></div>
                <div className="relative grid grid-cols-2 gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 ">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <BrushCleaning />
                  </Button>
                  <Button
                    size="sm"
                    disabled
                    className="bg-gradient-to-r from-red-400 to-red-400 text-white font-semibold rounded-xl shadow-lg"
                  >
                    กำลังใช้
                  </Button>
                </div>
              </div>
            )}

            {table.status === "cleaning" && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/50 to-green-200/50 rounded-2xl blur-sm"></div>
                <div className="relative p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    onClick={() => onStatusChange(table.id, "available")}
                  >
                    เสร็จแล้ว
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Dialog confirm */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
            <DialogDescription>
              ลูกค้ากำลังใช้งาน แน่ใจหรือไม่ว่าจะเปลี่ยนสถานะโต๊ะเป็น{" "}
              <span className="font-semibold text-red-500">ทำความสะอาด</span> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-gradient-to-r from-gray-500 to-slate-600 text-white"
              onClick={() => {
                onStatusChange(table.id, "cleaning");
                setConfirmOpen(false);
              }}
            >
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
