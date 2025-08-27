"use client";

import React, { useState } from "react";
import { Save, Plus, Users, Type, AlertCircle, Grid3X3 } from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface AddEditTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    number: string;
    seats: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      number: string;
      seats: string;
    }>
  >;
  onSubmit: () => Promise<void>;
  title: string;
  description: string;
}

export const AddEditTableDialog: React.FC<AddEditTableDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  title,
  description,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) {
      newErrors.number = "กรุณาระบุหมายเลขโต๊ะ";
    }

    const seats = parseInt(formData.seats);
    if (isNaN(seats) || seats < 1 || seats > 20) {
      newErrors.seats = "จำนวนที่นั่งต้องอยู่ระหว่าง 1-20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 opacity-50 rounded-3xl"></div>
        <div className="relative">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 py-6">
            {/* Basic Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 opacity-60 rounded-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-teal-200/50 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-teal-800 to-cyan-800 bg-clip-text text-transparent">
                    ข้อมูลโต๊ะ
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Table Number */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Type className="w-4 h-4" />
                      หมายเลขโต๊ะ
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                        className={`bg-white/80 backdrop-blur-sm rounded-xl border-2 ${
                          errors.number
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-teal-500"
                        } focus:outline-none transition-colors shadow-lg`}
                        placeholder="เช่น 1, A1, VIP-01"
                      />
                      {errors.number && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4" />
                      จำนวนที่นั่ง
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData({ ...formData, seats: e.target.value })
                        }
                        className={`bg-white/80 backdrop-blur-sm rounded-xl border-2 ${
                          errors.seats
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-teal-500"
                        } focus:outline-none transition-colors shadow-lg`}
                      />
                      {errors.seats && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.seats}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    บันทึกโต๊ะ
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
