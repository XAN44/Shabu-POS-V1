// components/menu/CategoryFilter.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "../../types/menu";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  menuItems: MenuItem[];
  onCategorySelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  menuItems,
  onCategorySelect,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(category)}
            className={`rounded-full transition-all ${
              selectedCategory === category
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg transform scale-105"
                : "bg-white/80 hover:bg-orange-50 text-gray-700 border-gray-200"
            }`}
          >
            {category === "all" ? "ทั้งหมด" : category}
            {category !== "all" && (
              <span className="ml-1 text-xs opacity-75">
                ({menuItems.filter((item) => item.category === category).length}
                )
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
