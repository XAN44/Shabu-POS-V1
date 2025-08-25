// data/chartData.ts

import { MenuDataByPeriod, SalesDataByPeriod } from "./typesChart";

export const salesData: SalesDataByPeriod = {
  today: {
    labels: [
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ],
    values: [0, 150, 450, 1200, 1800, 800, 600, 900, 1500, 2200, 2800, 1900],
  },
  thisWeek: {
    labels: ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"],
    values: [12000, 18000, 25000, 22000, 35000, 42000, 38000],
  },
  thisMonth: {
    labels: ["สัปดาห์ที่ 1", "สัปดาห์ที่ 2", "สัปดาห์ที่ 3", "สัปดาห์ที่ 4"],
    values: [180000, 220000, 195000, 240000],
  },
  thisYear: {
    labels: [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ],
    values: [
      850000, 780000, 920000, 1100000, 980000, 1250000, 1180000, 1320000,
      1050000, 1150000, 1280000, 1450000,
    ],
  },
};

export const menuData: MenuDataByPeriod = {
  today: [
    { name: "ชาบูเนื้อ", quantity: 8, color: "rgba(255, 99, 132, 0.8)" },
    { name: "ชาบูทะเล", quantity: 6, color: "rgba(53, 162, 235, 0.8)" },
    { name: "ลูกชิ้นรวม", quantity: 12, color: "rgba(255, 206, 86, 0.8)" },
    { name: "ของทานเล่น", quantity: 15, color: "rgba(75, 192, 192, 0.8)" },
    { name: "เครื่องดื่ม", quantity: 20, color: "rgba(153, 102, 255, 0.8)" },
  ],
  thisWeek: [
    { name: "ชาบูเนื้อ", quantity: 45, color: "rgba(255, 99, 132, 0.8)" },
    { name: "ชาบูทะเล", quantity: 38, color: "rgba(53, 162, 235, 0.8)" },
    { name: "ลูกชิ้นรวม", quantity: 62, color: "rgba(255, 206, 86, 0.8)" },
    { name: "ของทานเล่น", quantity: 85, color: "rgba(75, 192, 192, 0.8)" },
    { name: "เครื่องดื่ม", quantity: 120, color: "rgba(153, 102, 255, 0.8)" },
  ],
  thisMonth: [
    { name: "ชาบูเนื้อ", quantity: 180, color: "rgba(255, 99, 132, 0.8)" },
    { name: "ชาบูทะเล", quantity: 150, color: "rgba(53, 162, 235, 0.8)" },
    { name: "ลูกชิ้นรวม", quantity: 220, color: "rgba(255, 206, 86, 0.8)" },
    { name: "ของทานเล่น", quantity: 320, color: "rgba(75, 192, 192, 0.8)" },
    { name: "เครื่องดื่ม", quantity: 480, color: "rgba(153, 102, 255, 0.8)" },
  ],
  thisYear: [
    { name: "ชาบูเนื้อ", quantity: 2150, color: "rgba(255, 99, 132, 0.8)" },
    { name: "ชาบูทะเล", quantity: 1880, color: "rgba(53, 162, 235, 0.8)" },
    { name: "ลูกชิ้นรวม", quantity: 2650, color: "rgba(255, 206, 86, 0.8)" },
    { name: "ของทานเล่น", quantity: 3920, color: "rgba(75, 192, 192, 0.8)" },
    { name: "เครื่องดื่ม", quantity: 5800, color: "rgba(153, 102, 255, 0.8)" },
  ],
};
