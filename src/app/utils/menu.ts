// utils/menu.ts

import { MenuItem } from "../types/menu";

export const getStatusText = (status: string): string => {
  switch (status) {
    case "new":
      return "กำลังเตรียม";
    case "preparing":
      return "กำลังทำ";
    case "ready":
      return "พร้อมเสิร์ฟ";
    case "served":
      return "เสิร์ฟแล้ว";
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "new":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "preparing":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "ready":
      return "bg-green-100 text-green-800 border-green-300";
    case "served":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getUniqueCategories = (menuItems: MenuItem[]): string[] => {
  return [
    "all",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];
};

export const filterItemsByCategory = (
  items: MenuItem[],
  category: string
): MenuItem[] => {
  return category === "all"
    ? items
    : items.filter((item) => item.category === category);
};
