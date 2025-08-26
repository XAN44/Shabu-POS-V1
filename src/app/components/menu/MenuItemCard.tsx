// components/menu/MenuItemCard.tsx
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon } from "lucide-react";
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
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden hover:scale-105 transform"
      onClick={() => onItemClick(item)}
    >
      <div className="relative">
        {item.image ? (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-colors duration-300">
            <ImageIcon className="w-16 h-16 text-orange-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="bg-white/90 text-gray-700 border-0 shadow-md"
          >
            {item.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {item.name}
            </CardTitle>
          </div>

          {item.description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-2xl font-bold text-orange-600">
              ฿{item.price.toLocaleString()}
            </span>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
