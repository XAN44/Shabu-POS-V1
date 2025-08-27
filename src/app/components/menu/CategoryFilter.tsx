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
  const getCategoryCount = (category: string) => {
    return category === "all"
      ? menuItems.length
      : menuItems.filter((item) => item.category === category).length;
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      {/* Section Header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          หมวดหมู่อาหาร
        </h2>
        <div className="w-20 md:w-24 h-1 md:h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full mx-auto shadow-lg"></div>
      </div>

      {/* Desktop and Tablet Layout */}
      <div className="hidden md:block">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
            {categories.map((category) => {
              const count = getCategoryCount(category);
              const isSelected = selectedCategory === category;

              return (
                <Button
                  key={category}
                  variant={isSelected ? "default" : "outline"}
                  size="lg"
                  onClick={() => onCategorySelect(category)}
                  data-state={isSelected ? "selected" : "default"}
                  className={`
                    relative overflow-hidden rounded-xl px-4 md:px-6 py-3 md:py-4 font-bold text-sm md:text-base
                    transition-all duration-300 ease-out group whitespace-nowrap
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105 border-0"
                        : "bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-lg transform hover:scale-102 hover:-translate-y-0.5"
                    }
                    print:bg-white print:text-gray-900 print:border-gray-300
                  `}
                  aria-pressed={isSelected}
                  aria-label={`เลือกหมวดหมู่ ${
                    category === "all" ? "ทั้งหมด" : category
                  } มี ${count} รายการ`}
                >
                  <span className="relative z-10 mr-2">
                    {category === "all" ? "ทั้งหมด" : category}
                  </span>
                  <span
                    className={`
                      relative z-10 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold
                      ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
                      }
                    `}
                  >
                    {count}
                  </span>
                  {/* Gradient hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  {/* Active glow effect */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 rounded-xl animate-pulse"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 sm:gap-3 pb-2 min-w-max">
              {categories.map((category) => {
                const count = getCategoryCount(category);
                const isSelected = selectedCategory === category;

                return (
                  <Button
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategorySelect(category)}
                    data-state={isSelected ? "selected" : "default"}
                    className={`
                      relative overflow-hidden rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm
                      transition-all duration-300 whitespace-nowrap min-w-max
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30 scale-105 border-0"
                          : "bg-white/95 dark:bg-gray-700/95 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-white dark:hover:bg-gray-700"
                      }
                      print:bg-white print:text-gray-900 print:border-gray-300
                    `}
                    aria-pressed={isSelected}
                    aria-label={`เลือกหมวดหมู่ ${
                      category === "all" ? "ทั้งหมด" : category
                    } มี ${count} รายการ`}
                  >
                    <span className="mr-1.5 sm:mr-2">
                      {category === "all" ? "ทั้งหมด" : category}
                    </span>
                    <span
                      className={`
                        px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold
                        ${
                          isSelected
                            ? "bg-white/25 text-white"
                            : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
                        }
                      `}
                    >
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .transition-all {
            transition: none;
          }
          .animate-pulse {
            animation: none;
          }
        }

        @media print {
          .backdrop-blur-xl {
            backdrop-filter: none;
          }
          .shadow-xl {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};
