import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Edit3, Trash2 } from "lucide-react";
import { Table } from "@/src/app/types/Order";

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800";
      case "occupied":
        return "bg-red-100 border-red-300 text-red-800";
      case "reserved":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "cleaning":
        return "bg-gray-100 border-gray-300 text-gray-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "ว่าง";
      case "occupied":
        return "มีลูกค้า";
      case "reserved":
        return "จอง";
      case "cleaning":
        return "ทำความสะอาด";
      default:
        return status;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${getStatusColor(
        table.status
      )}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">โต๊ะ {table.number}</CardTitle>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Users className="w-3 h-3 mr-1" />
              {table.seats} ที่นั่ง
            </div>
            <div className="text-xs text-gray-500 mt-1">ID: {table.id}</div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getStatusText(table.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShowQR(table.id)}
            className="flex-1 min-w-0"
          >
            <QrCode className="w-3 h-3 mr-1" /> QR
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(table.id)}>
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(table.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Status Buttons */}
        {table.status === "available" && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(table.id, "occupied")}
              className="text-xs"
            >
              มีลูกค้า
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(table.id, "reserved")}
              className="text-xs"
            >
              จอง
            </Button>
          </div>
        )}

        {(table.status === "occupied" || table.status === "reserved") && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(table.id, "cleaning")}
              className="text-xs"
            >
              ทำความสะอาด
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(table.id, "available")}
              className="text-xs"
            >
              ว่าง
            </Button>
          </div>
        )}

        {table.status === "cleaning" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange(table.id, "available")}
            className="w-full mt-2 text-xs"
          >
            เสร็จแล้ว
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
