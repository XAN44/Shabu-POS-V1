import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Utensils } from "lucide-react";
import { MenuItem } from "../../types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onItemClick,
}) => {
  return (
    <Card
      className="group cursor-pointer transition-all duration-500 ease-out bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-900/20 transform hover:scale-[1.02] hover:-translate-y-1 relative focus-within:ring-4 focus-within:ring-orange-500/20 print:shadow-none print:border-gray-300"
      onClick={() => onItemClick(item)}
      role="button"
      tabIndex={0}
      aria-label={`เลือก ${item.name} ราคา ${item.price} บาท`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick(item);
        }
      }}
    >
      {/* Gradient border glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

      <div className="relative z-10">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
          {item.image ? (
            <div className="relative w-full h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={false}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Desktop Action button overlay */}
              <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <Button
                  size="lg"
                  className="bg-white/95 hover:bg-white text-orange-600 hover:text-orange-700 rounded-full px-6 py-3 shadow-xl backdrop-blur-sm font-bold transform hover:scale-105 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                  aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 bg-gradient-to-br from-orange-100 via-amber-50 to-red-100 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-red-900/20 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 dark:group-hover:from-orange-800/30 dark:group-hover:to-red-800/30 transition-all duration-500 relative">
              <div className="text-center space-y-3">
                <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full p-4 inline-flex items-center justify-center">
                  <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 group-hover:text-orange-500 transition-colors duration-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  ไม่มีรูปภาพ
                </p>
              </div>

              {/* Desktop Action button for no-image items */}
              <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <Button
                  size="lg"
                  className="bg-white/95 hover:bg-white text-orange-600 hover:text-orange-700 rounded-full px-6 py-3 shadow-xl backdrop-blur-sm font-bold transform hover:scale-105 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                  aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  เพิ่มลงตะกร้า
                </Button>
              </div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <Badge
              variant="secondary"
              className="bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 border-0 shadow-lg backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 font-semibold rounded-full text-xs sm:text-sm print:bg-white print:text-gray-900"
            >
              {item.category}
            </Badge>
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <span className="text-xs sm:text-sm font-bold">
                ฿{item.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Title */}
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 line-clamp-2 leading-tight print:text-gray-900">
                {item.name}
              </CardTitle>
            </div>

            {/* Description */}
            {item.description && (
              <div className="min-h-[2.5rem] sm:min-h-[3rem]">
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-2 leading-relaxed print:text-gray-700">
                  {item.description}
                </p>
              </div>
            )}

            {/* Bottom section */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ราคา
                  </span>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                    ฿{item.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="flex sm:hidden items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ราคา
                  </span>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    ฿{item.price.toLocaleString()}
                  </div>
                </div>

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl px-3 py-2 font-bold shadow-lg transform active:scale-95 transition-all duration-200 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                  aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่ม
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Unavailable overlay */}
      {!item.available && (
        <div className="absolute inset-0 bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl sm:rounded-3xl">
          <div className="text-center text-white space-y-2">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">หมด</div>
            <div className="text-xs sm:text-sm opacity-80 bg-white/20 px-3 py-1 rounded-full">
              ชั่วคราว
            </div>
          </div>
        </div>
      )}

      {/* Focus ring */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-0 group-focus-within:ring-4 group-focus-within:ring-orange-500/20 transition-all duration-300 pointer-events-none"></div>
    </Card>
  );
};
