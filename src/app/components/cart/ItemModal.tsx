"use client";
// components/cart/ItemModal.tsx
import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Utensils } from "lucide-react";
import { MenuItem } from "@prisma/client";

interface ItemModalProps {
  item: MenuItem | null;
  quantity: number;
  onClose: () => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  quantity,
  onClose,
  onQuantityChange,
  onAddToCart,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 overflow-y-auto print:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-lg sm:max-w-2xl shadow-2xl overflow-hidden max-h-screen sm:max-h-[95vh] overflow-y-auto relative animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 rounded-full p-2 sm:p-3 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 focus:ring-4 focus:ring-orange-500/20 mt-6"
          aria-label="ปิด"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Image Section */}
        <div className="relative">
          {item.image ? (
            <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          ) : (
            <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-orange-100 via-amber-50 to-red-100 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-red-900/20 flex items-center justify-center">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full p-4 sm:p-6 inline-flex items-center justify-center">
                  <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400" />
                </div>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-medium">
                  ไม่มีรูปภาพ
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <h2
                  id="modal-title"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2"
                >
                  {item.name}
                </h2>
                <Badge
                  variant="outline"
                  className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-full text-xs sm:text-sm"
                >
                  {item.category}
                </Badge>
              </div>
            </div>

            {item.description && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <p
                  id="modal-description"
                  className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg"
                >
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 sm:p-6 border-2 border-orange-100 dark:border-orange-800">
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                ราคาต่อหน่วย
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 dark:text-orange-400">
                ฿{item.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                เลือกจำนวน
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                กรุณาเลือกจำนวนที่ต้องการ
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-600 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-orange-500/20"
                  aria-label="ลดจำนวน"
                >
                  <Minus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
                </button>

                <div className="text-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-3 sm:p-4 shadow-lg">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold block">
                      {quantity}
                    </span>
                    <span className="text-xs sm:text-sm opacity-90">จำนวน</span>
                  </div>
                </div>

                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-orange-500/20"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  ราคารวม
                </p>
                <p className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 mt-1">
                  {quantity} รายการ
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                  ฿{(item.price * quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 sm:h-14 md:h-16 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-base sm:text-lg transition-all duration-300 focus:ring-4 focus:ring-gray-500/20"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={onAddToCart}
              className="flex-1 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 rounded-xl shadow-xl font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-2xl transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-orange-500/20"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up,
          .animate-scale-in,
          .transition-all,
          .transform {
            animation: none;
            transition: none;
            transform: none;
          }
        }

        @media print {
          .fixed {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
