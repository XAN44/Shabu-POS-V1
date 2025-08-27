"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Shield, Zap, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ open, onOpenChange, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setConfirmText("");
  };

  const isConfirmDisabled = confirmText !== "DELETE" || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-50 rounded-3xl"></div>
        <div className="relative">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-700 bg-clip-text text-transparent">
                  ยืนยันการลบ
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Warning Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-80 rounded-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-red-200/50 shadow-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-red-800 to-pink-800 bg-clip-text text-transparent mb-3">
                      คำเตือนความปลอดภัย
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="font-medium">
                        คุณกำลังจะลบโต๊ะนี้ออกจากระบบ
                      </p>
                      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                        <ul className="text-sm space-y-1 text-yellow-800">
                          <li>• ข้อมูลโต๊ะจะถูกลบอย่างถาวร</li>
                          <li>• QR Code ของโต๊ะจะไม่สามารถใช้งานได้</li>
                          <li>• ไม่สามารถเรียกคืนข้อมูลได้</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 opacity-80 rounded-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-slate-800 bg-clip-text text-transparent">
                      ยืนยันการดำเนินการ
                    </h3>
                  </div>

                  <p className="text-gray-700 font-medium">
                    พิมพ์{" "}
                    <code className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                      DELETE
                    </code>{" "}
                    เพื่อยืนยันการลบ:
                  </p>

                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-red-300 focus:border-red-500 focus:outline-none transition-colors shadow-lg text-center font-mono font-bold"
                    placeholder="พิมพ์ DELETE"
                  />

                  {confirmText && confirmText !== "DELETE" && (
                    <p className="text-red-600 text-sm font-medium text-center">
                      กรุณาพิมพ์ &quot;DELETE&quot; ให้ถูกต้อง
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  ลบโต๊ะ
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
