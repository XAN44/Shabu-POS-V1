"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateQRCodeDataURL, generateTableQRURL } from "../../utils/qrCode";
import { Table } from "@/src/app/types/Order";
import Image from "next/image";

interface QRCodeDialogProps {
  table: Table | null;
  open: boolean;
  onClose: () => void;
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  table,
  open,
  onClose,
}) => {
  const [qrDataURL, setQrDataURL] = useState("");

  useEffect(() => {
    if (table) {
      const url = generateTableQRURL(table.id);
      generateQRCodeDataURL(url).then(setQrDataURL);
    }
  }, [table]);

  if (!table) return null;

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.download = `table-${table.number}-qr.png`;
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - โต๊ะ {table.number}</DialogTitle>
          <DialogDescription>
            ลูกค้าสแกน QR Code นี้เพื่อเข้าสู่หน้าเมนูและสั่งอาหาร
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
            {qrDataURL && (
              <Image
                src={qrDataURL}
                alt={`QR Code for Table ${table.number}`}
                width={200}
                height={200}
                unoptimized
                className="object-cover"
              />
            )}
          </div>
          <div className="text-center space-y-2">
            <div className="font-semibold">โต๊ะ {table.number}</div>
            <div className="text-sm text-gray-600">ID: {table.id}</div>
            <div className="text-sm text-gray-600">{table.seats} ที่นั่ง</div>
          </div>
          <div className="w-full p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">URL:</div>
            <div className="text-sm font-mono break-all">
              {generateTableQRURL(table.id)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            ปิด
          </Button>
          <Button
            onClick={downloadQRCode}
            disabled={!qrDataURL}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลด QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
