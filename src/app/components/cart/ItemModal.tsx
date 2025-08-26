// components/cart/ItemModal.tsx
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, ImageIcon } from "lucide-react";
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
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Image Section */}
        {item.image ? (
          <div className="relative w-full h-64">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-64 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <ImageIcon className="w-20 h-20 text-orange-300" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-300"
              >
                {item.category}
              </Badge>
            </div>
            {item.description && (
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-orange-600 text-center">
              ฿{item.price.toLocaleString()}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">จำนวน</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full border-2 border-orange-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <Minus className="w-5 h-5 text-orange-600" />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-12 h-12 rounded-full border-2 border-orange-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <Plus className="w-5 h-5 text-orange-600" />
              </button>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                ราคารวม:
              </span>
              <span className="text-2xl font-bold text-orange-600">
                ฿{(item.price * quantity).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl border-gray-300"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={onAddToCart}
                className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
