import { OrderStatus, TableStatus } from "@prisma/client";

// Socket.io event types - Fixed to handle string to enum conversion
export interface NewOrderEvent {
  orderId: string;
  tableId: string;
  tableName?: string;
  totalAmount: number;
  itemsCount: number;
  customerName?: string;
  timestamp: Date;
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  tableId?: string;
  timestamp: Date;
}

export interface TableStatusEvent {
  tableId: string;
  status: TableStatus; // Changed from string to TableStatus
  timestamp: Date;
}

export interface OrderStatusUpdateEvent {
  orderId: string;
  status: OrderStatus;
  tableId: string;
}

// Status message mapping type
export type StatusMessages = {
  [K in OrderStatus]: string;
};

export const statusMessages: StatusMessages = {
  new: "ออเดอร์ใหม่",
  preparing: "กำลังเตรียม",
  ready: "พร้อมเสิร์ฟ",
  served: "เสิร์ฟแล้ว",
  cancelled: "ยกเลิกแล้ว",
};

// Helper function to safely convert string to OrderStatus
export function parseOrderStatus(status: string): OrderStatus {
  const validStatuses: OrderStatus[] = [
    "new",
    "preparing",
    "ready",
    "served",
    "cancelled",
  ];
  return validStatuses.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "new";
}

// Helper function to safely convert string to TableStatus
export function parseTableStatus(status: string): TableStatus {
  const validStatuses: TableStatus[] = [
    "available",
    "occupied",
    "reserved",
    "cleaning",
  ];
  return validStatuses.includes(status as TableStatus)
    ? (status as TableStatus)
    : "available";
}

// Order input types
export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  option?: string;
  notes?: string;
}

export interface OrderInput {
  tableId: string;
  notes?: string;
  items: OrderItemInput[];
  customerName?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  notes?: string;
}

// Updated Socket.IO types to match your server implementation
export interface ServerToClientEvents {
  hello: (data: string) => void;
  pong: (data: string) => void;
  connectionStatus: (data: {
    connected: boolean;
    clientsCount: number;
  }) => void;

  // Order-related events - Server sends string, we'll parse to enum
  newOrder: (data: {
    orderId: string;
    tableId: string;
    tableName?: string;
    totalAmount: number;
    itemsCount: number;
    customerName?: string;
    timestamp: Date;
  }) => void;

  orderStatusChanged: (data: {
    orderId: string;
    status: string; // Server sends string
    tableId?: string;
    timestamp: Date;
  }) => void;

  orderStatusUpdated: (data: {
    orderId: string;
    status: string; // Server sends string
    timestamp: Date;
  }) => void;

  // Table-related events
  tableStatusChanged: (data: {
    tableId: string;
    status: string; // Server sends string
    timestamp: Date;
  }) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  ping: () => void;

  // Room management
  joinTable: (tableId: string) => void;
  leaveTable: (tableId: string) => void;

  // Order events
  orderStatusUpdate: (data: OrderStatusUpdateEvent) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  username?: string;
  tableId?: string;
}
