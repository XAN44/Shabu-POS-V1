// components/QRCodeUpload.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface QRCodeUploadProps {
  currentQrCode?: string | null;
  onQrCodeUpdate: (qrCodeUrl: string) => void;
  disabled?: boolean;
  className?: string;
}

export const QRCodeUpload: React.FC<QRCodeUploadProps> = ({
  currentQrCode,
  onQrCodeUpdate,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    // สร้าง preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "qr-codes");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("การอัพโหลดล้มเหลว");
      }

      const result = await response.json();

      if (result.success && result.data?.secure_url) {
        setUploadedImage(result.data.secure_url);
        toast.success("อัพโหลด QR Code สำเร็จ!");
      } else {
        throw new Error("ไม่พบ URL ของรูปภาพ");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "การอัพโหลดล้มเหลว");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!uploadedImage) {
      toast.error("กรุณาอัพโหลดรูปภาพก่อน");
      return;
    }

    try {
      // บันทึกลิงค์ QR Code ลง database
      const response = await fetch("/api/qr-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeUrl: uploadedImage,
        }),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถบันทึกข้อมูลได้");
      }

      // อัพเดตข้อมูลในคอมโพเนนต์หลัก
      onQrCodeUpdate(uploadedImage);

      // รีเซ็ตและปิด dialog
      handleClose();

      toast.success("บันทึก QR Code สำเร็จ!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้"
      );
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreviewImage(null);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant={currentQrCode ? "outline" : "default"}
            size="sm"
            disabled={disabled}
            className={
              currentQrCode
                ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          >
            {currentQrCode ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข QR Code
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                อัพโหลด QR Code
              </>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {currentQrCode ? "แก้ไข QR Code" : "อัพโหลด QR Code"}
            </DialogTitle>
            <DialogDescription>
              อัพโหลด QR Code สำหรับการชำระเงิน (รองรับ JPG, PNG, GIF)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current QR Code Display */}
            {currentQrCode && !previewImage && !uploadedImage && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">QR Code ปัจจุบัน:</Label>
                <Card className="p-3">
                  <div className="flex items-center justify-center">
                    <Image
                      width={1280}
                      height={1280}
                      src={currentQrCode}
                      alt="Current QR Code"
                      className="max-w-32 max-h-32 object-contain rounded-lg"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="qr-upload" className="text-sm font-medium">
                เลือกไฟล์ QR Code ใหม่:
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleButtonClick}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  เลือกรูปภาพ
                </Button>
              </div>
            </div>

            {/* Preview Image */}
            {previewImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">ตัวอย่าง:</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviewImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Card className="p-3">
                  <div className="flex items-center justify-center">
                    <Image
                      height={1080}
                      width={1080}
                      src={previewImage}
                      alt="Preview"
                      className="max-w-40 max-h-40 object-contain rounded-lg"
                    />
                  </div>
                </Card>

                {!uploadedImage && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังอัพโหลด...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        อัพโหลด
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Upload Success */}
            {uploadedImage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">อัพโหลดสำเร็จ!</span>
                </div>
                <Card className="p-3 border-green-200 bg-green-50">
                  <div className="flex items-center justify-center">
                    <Image
                      height={1080}
                      width={1080}
                      src={uploadedImage}
                      alt="Uploaded QR Code"
                      className="max-w-40 max-h-40 object-contain rounded-lg"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Error State */}
            {!isUploading && previewImage && !uploadedImage && (
              <div className="flex items-center gap-2 text-amber-600 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  กรุณาอัพโหลดรูปภาพเพื่อดำเนินการต่อ
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              disabled={!uploadedImage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
