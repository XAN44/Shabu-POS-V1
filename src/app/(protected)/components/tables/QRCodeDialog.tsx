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
      <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 space-y-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
            QR Code - โต๊ะ {table.number}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center px-2">
            ลูกค้าสแกน QR Code นี้เพื่อเข้าสู่หน้าเมนูและสั่งอาหาร
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 space-y-4">
          {/* QR Code Container */}
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
              {qrDataURL ? (
                <Image
                  src={qrDataURL}
                  alt={`QR Code for Table ${table.number}`}
                  width={180}
                  height={180}
                  unoptimized
                  className="w-44 h-44 sm:w-48 sm:h-48 object-cover"
                />
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 text-sm">กำลังโหลด...</div>
                </div>
              )}
            </div>
          </div>

          {/* Table Info */}
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                โต๊ะ {table.number}
              </div>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                <span>ID: {table.id}</span>
                <span>•</span>
                <span>{table.seats} ที่นั่ง</span>
              </div>
            </div>

            {/* URL Display */}
            <div className="w-full bg-gray-50 rounded-lg p-3 border">
              <div className="text-xs font-medium text-gray-700 mb-2">
                URL สำหรับลูกค้า:
              </div>
              <div className="text-xs sm:text-sm font-mono bg-white border rounded px-2 py-2 break-all text-gray-800 leading-relaxed">
                {generateTableQRURL(table.id)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-9"
          >
            ปิด
          </Button>
          <Button
            onClick={downloadQRCode}
            disabled={!qrDataURL}
            className="w-full sm:w-auto order-1 sm:order-2 h-10 sm:h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">ดาวน์โหลด QR Code</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
