// types/order.ts
export interface MenuAddon {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonId?: string;
  name: string;
  price: number;
  quantity: number;
  addon?: MenuAddon;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageKey?: string;
  available: boolean;
  addons?: MenuAddon[];
}

export interface UploadedFile {
  id: string;
  key: string; // Cloudinary key
  url: string; // Cloudinary URL
  name: string; // Original filename
  size: number; // File size in bytes
  type: string; // MIME type
  uploadedBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string;
  quantity: number;
  notes?: string;
  price: number;
  menuItemName?: string;
  menuItem: MenuItem;
  addons?: OrderItemAddon[];
}

export interface Table {
  id: string;
  number: string;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  qrCode?: string;
  lastClearedAt?: string;
}

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface Order {
  id: string;
  tableId?: string;
  status: "new" | "preparing" | "ready" | "served" | "cancelled";
  totalAmount: number;
  orderTime: Date;
  notes?: string;
  customerName?: string;
  tableNumber?: string;
  table?: Table;
  items: OrderItem[];
  billId?: string;
}

export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonId?: string;
  name: string;
  price: number;
  quantity: number;
  addon?: MenuAddon; // optional กรณีอยาก include รายละเอียด addon เต็ม ๆ
}

// ========== Dashboard Metrics ==========

export interface MetricsItem {
  value: string;
  trend?: string; // ✅ ทำให้ optional กัน error TS
  isPositive?: boolean;
  utilization?: number;
  newOrders?: number;
  inKitchen?: number;
  readyToServe?: number;
}

export interface CurrentMetrics {
  sales: MetricsItem;
  tables: MetricsItem;
  orders: MetricsItem;
  activeOrders: MetricsItem;
}

export interface DashboardApiResponse {
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  readyOrders: number;
  totalRevenue: number;
  availableTables: number;
  occupiedTables: number;
}

export interface DashboardMetrics {
  preparingOrders: number;
  totalRevenue: number;
  totalOrders: number;
  newOrders: number;
  readyOrders: number;
  availableTables: number;
  occupiedTables: number;
  orders?: Order[];
  tables?: Table[];
}

// สำหรับ component Overview

export interface CurrentMetrics {
  sales: MetricsItem;
  tables: MetricsItem;
  orders: MetricsItem;
  activeOrders: MetricsItem;
}

export interface DraftCartItem {
  id: string;
  draftCartItemId: string;
  menuItemId?: string;
  quantity: number;
  menuItemName?: string;
  menuItemPrice?: number;
  menuItem?: MenuItem;
  addons?: DraftCartItemAddon[]; // เพิ่ม addons
}

export interface DraftCart {
  id: string;
  tableId: string;
  items: DraftCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DraftCartItemAddon {
  id: string;
  draftCartItemId: string;
  addonId?: string;
  name: string;
  price: number;
  quantity: number;
  addon?: MenuAddon;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageKey?: string;
  available: boolean;
  addons?: MenuAddon[]; // เพิ่ม addons
}
