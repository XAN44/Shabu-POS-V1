export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageKey?: string;
  available: boolean;
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
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  seats: number;
  qrCode?: string;
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
  tableId: string;
  table: Table;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  orderTime: Date;
  notes?: string;
  customerName?: string;
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
