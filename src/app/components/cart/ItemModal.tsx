"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Utensils, ShoppingBag, Info } from "lucide-react";
import { SelectedAddon } from "../../types/menu";

interface Addon {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available: boolean;
}

interface MenuItemWithAddons {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image: string | null;
  imageKey: string | null;
  available: boolean;
  addons?: Addon[];
}

interface ItemModalProps {
  item: MenuItemWithAddons | null;
  quantity: number;
  selectedAddons: SelectedAddon[];
  onClose: () => void;
  onQuantityChange: (quantity: number) => void;
  onSelectedAddonsChange: (addons: SelectedAddon[]) => void;
  onAddToCart: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  quantity,
  selectedAddons,
  onClose,
  onQuantityChange,
  onSelectedAddonsChange,
  onAddToCart,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!item) return null;

  const incrementAddon = (addon: Addon) => {
    const existing = selectedAddons.find((a) => a.addon.id === addon.id);
    if (existing) {
      const newAddons = selectedAddons.map((a) =>
        a.addon.id === addon.id ? { ...a, quantity: a.quantity + 1 } : a
      );
      onSelectedAddonsChange(newAddons);
    } else {
      onSelectedAddonsChange([...selectedAddons, { addon, quantity: 1 }]);
    }
  };

  const decrementAddon = (addon: Addon) => {
    const existing = selectedAddons.find((a) => a.addon.id === addon.id);
    if (!existing) return;

    if (existing.quantity === 1) {
      const newAddons = selectedAddons.filter((a) => a.addon.id !== addon.id);
      onSelectedAddonsChange(newAddons);
    } else {
      const newAddons = selectedAddons.map((a) =>
        a.addon.id === addon.id ? { ...a, quantity: a.quantity - 1 } : a
      );
      onSelectedAddonsChange(newAddons);
    }
  };

  const getAddonQuantity = (addonId: string) => {
    return selectedAddons.find((a) => a.addon.id === addonId)?.quantity || 0;
  };

  const calculateBasePrice = () => item.price * quantity;
  const calculateAddonsPrice = () => {
    return (
      selectedAddons.reduce(
        (sum, selected) => sum + selected.addon.price * selected.quantity,
        0
      ) * quantity
    );
  };
  const calculateTotal = () => calculateBasePrice() + calculateAddonsPrice();

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container - Responsive sizing */}
      <div
        className="bg-white dark:bg-gray-900 w-full sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] max-w-5xl h-full sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <Badge variant="secondary" className="text-sm font-medium">
              {item.category}
            </Badge>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="ปิด"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
            {/* Left Column - Image and Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-800">
              {/* Image Section */}
              <div className="relative w-full h-64 sm:h-80 lg:h-96">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Utensils className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        ไม่มีรูปภาพ
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {item.name}
                </h1>

                {item.description && (
                  <div className="mb-6">
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        รายละเอียด
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-7">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Price Display */}
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      ราคาต่อจาน
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                      ฿{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customization and Actions */}
            <div className="flex flex-col">
              <div className="flex-1 p-6 sm:p-8 space-y-8">
                {/* Quantity Selector */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    จำนวน
                  </h3>
                  <div className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                    <button
                      onClick={() =>
                        onQuantityChange(Math.max(1, quantity - 1))
                      }
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div className="px-8 py-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 min-w-[80px] text-center">
                      <span className="text-2xl font-bold">{quantity}</span>
                    </div>

                    <button
                      onClick={() => onQuantityChange(quantity + 1)}
                      className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Addons Section */}
                {item.addons && item.addons.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      เพิ่มเติม
                    </h3>
                    <div className="space-y-3">
                      {item.addons
                        .filter((addon) => addon.available)
                        .map((addon) => {
                          const addonQty = getAddonQuantity(addon.id);
                          return (
                            <div
                              key={addon.id}
                              className={`border rounded-2xl p-4 transition-colors ${
                                addonQty > 0
                                  ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {addon.name}
                                    </h4>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                      +฿{addon.price.toLocaleString()}
                                    </span>
                                  </div>
                                  {addon.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {addon.description}
                                    </p>
                                  )}
                                  {addonQty > 0 && (
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      เลือกแล้ว: {addonQty} รายการ (฿
                                      {(
                                        addon.price * addonQty
                                      ).toLocaleString()}{" "}
                                      ต่อจาน)
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 xs:ml-4">
                                  <button
                                    onClick={() => decrementAddon(addon)}
                                    disabled={addonQty === 0}
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>

                                  <span className="w-8 text-center font-semibold">
                                    {addonQty}
                                  </span>

                                  <button
                                    onClick={() => incrementAddon(addon)}
                                    className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Selected Addons Summary */}
                {selectedAddons.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                      รายการที่เลือก
                    </h4>
                    <div className="space-y-2">
                      {selectedAddons.map((selected) => (
                        <div
                          key={selected.addon.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-blue-800 dark:text-blue-200">
                            {selected.addon.name} × {selected.quantity}
                          </span>
                          <span className="font-semibold text-blue-900 dark:text-blue-100">
                            ฿
                            {(
                              selected.addon.price * selected.quantity
                            ).toLocaleString()}
                            /จาน
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.name} × {quantity}
                      </span>
                      <span className="font-semibold">
                        ฿{calculateBasePrice().toLocaleString()}
                      </span>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          ของเสริม
                        </span>
                        <span className="font-semibold">
                          ฿{calculateAddonsPrice().toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          รวมทั้งหมด
                        </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ฿{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Action Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-900">
                <div className="flex flex-col xs:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 sm:h-14 text-base font-semibold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={onAddToCart}
                    className="flex-1 h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    เพิ่มลงตะกร้า ฿{calculateTotal().toLocaleString()}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
