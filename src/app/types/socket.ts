// types/socket.ts - Updated with proper Socket.IO types
import { Order, OrderStatus, TableStatus } from "@prisma/client";

/* -------------------- Event Payload Types -------------------- */
export interface NewOrderEvent {
  orderId: string;
  tableId: string;
  tableName: string;
  totalAmount: number;
  itemsCount: number;
  customerName?: string;
  timestamp: Date;
}

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
export interface CallStaffOrderPayload {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  orderTime: Date;
  itemsCount: number;
}

export interface CallStaffForBillEvent {
  type: "CALL_STAFF_FOR_BILL";
  tableId: string;
  tableNumber: string;
  tableName: string;
  totalAmount: number;
  orderCount: number;
  orders: CallStaffOrderPayload[];
  orderIds: string[];
  timestamp: string;
  customerRequest: boolean;
  urgent: boolean;
}

export interface StaffCalledEvent {
  tableId: string;
  message: string;
  timestamp: string;
  staffConfirmed?: boolean;
}

export interface StaffResponseEvent {
  tableId: string;
  staffId?: string;
  message: string;
  eta?: string;
  timestamp: string;
}

export interface StaffResponseFromDashboardEvent {
  tableId: string;
  message: string;
  timestamp: string;
  staffConfirmed: boolean;
}

export interface BillCreatedEvent {
  billId: string;
  totalAmount: number;
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  tableId: string;
  timestamp: Date;
}

export interface TableStatusEvent {
  tableId: string;
  status: TableStatus;
  timestamp: Date;
}

export interface OrderStatusUpdateEvent {
  orderId: string;
  status: OrderStatus;
  tableId: string;
}

/* -------------------- Status Mapping & Helpers -------------------- */
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

/* -------------------- Socket.IO Event Maps -------------------- */
export interface ServerToClientEvents {
  // Basic events
  hello: (data: string) => void;
  ping: () => void;
  pong: (data: { message: string; timestamp: Date }) => void;
  connectionStatus: (data: {
    connected: boolean;
    clientsCount: number;
  }) => void;

  // Order events
  newOrder: (data: NewOrderEvent) => void;
  orderStatusChanged: (data: {
    orderId: string;
    status: string;
    tableId: string;
    timestamp: Date;
  }) => void;
  orderStatusUpdated: (data: {
    orderId: string;
    status: string;
    timestamp: Date;
  }) => void;
  orderConfirmed: (data: {
    orderId: string;
    message: string;
    timestamp: Date;
  }) => void;

  // Table events
  tableStatusChanged: (data: {
    tableId: string;
    status: string;
    timestamp: Date;
  }) => void;
  tableOrdersUpdate: (data: {
    tableId: string;
    message: string;
    orders?: Order;
  }) => void;
  tableJoined: (data: { tableId: string; timestamp: Date }) => void;

  // Staff call events - ADD MISSING EVENTS HERE
  callStaffForBill: (data: CallStaffForBillEvent) => void;
  staffCalled: (data: StaffCalledEvent) => void;
  staffResponded: (data: StaffResponseEvent) => void;
  staffResponseFromDashboard: (data: StaffResponseFromDashboardEvent) => void;
  callStaffResponse: (data: StaffResponseEvent) => void;
  staffResponseConfirmed: (data: {
    tableId: string;
    timestamp: string;
  }) => void;

  // Customer staff call events - ADD THESE
  customerCallStaff: (data: {
    tableId: string;
    tableName: string;
    timestamp: string;
  }) => void;

  // Bill and checkout events
  billCreated: (data: BillCreatedEvent) => void;
  tableCheckedOut: (data: {
    tableId: string;
    totalAmount: number;
    orders: Order[];
    number: string;
    tableName: string;
    timestamp: string;
  }) => void;
  checkoutConfirmed: (data: {
    tableId: string;
    message: string;
    timestamp: Date;
  }) => void;

  // Utility events
  ordersUpdated: (orders: Order[]) => void;
  refreshOrders: (data: {
    tableId: string;
    message: string;
    timestamp: Date;
  }) => void;
  error: (data: { message: string; tableId?: string; timestamp: Date }) => void;
  healthResponse: (data: {
    status: string;
    timestamp: Date;
    connectedRooms: string[];
  }) => void;

  // Room status
  checkRoomStatus: (room: string) => void;
}

export interface ClientToServerEvents {
  // Basic events
  hello: () => void;
  ping: () => void;

  // Room management
  joinTable: (tableId: string) => void;
  leaveTable: (tableId: string) => void;
  joinDashboard: () => void;
  leaveDashboard: () => void;

  // Order events
  orderStatusUpdate: (data: OrderStatusUpdateEvent) => void;
  newOrderNotification: (data: {
    orderId: string;
    tableId: string;
    tableName: string;
    totalAmount: number;
    itemsCount: number;
    customerName?: string;
  }) => void;

  // Table events
  tableStatusUpdate: (data: { tableId: string; status: string }) => void;
  requestTableOrders: (tableId: string) => void;
  refreshTableOrders: (tableId: string) => void;

  // Staff call events - ADD MISSING EVENTS HERE
  callStaffForBill: (data: Omit<CallStaffForBillEvent, "timestamp">) => void;
  customerCallStaff: (data: {
    tableId: string;
    tableName: string;
    timestamp: string;
  }) => void;
  staffResponseFromDashboard: (data: StaffResponseFromDashboardEvent) => void;

  // Checkout events
  checkoutTable: (data: {
    tableId: string;
    totalAmount: number;
    orders: Order[];
    number: string;
    tableName: string;
    timestamp: string;
  }) => void;

  // Utility events
  healthCheck: () => void;
  checkRoomStatus: (room: string) => void;
}

/* -------------------- InterServerEvents -------------------- */
export interface InterServerEvents {
  ping: () => void;
  syncNewOrder?: (data: NewOrderEvent) => void;
  syncOrderStatus?: (data: OrderStatusEvent) => void;
}

/* -------------------- Socket Data -------------------- */
export interface SocketData {
  userId?: string;
  username?: string;
  tableId?: string;
  role?: "customer" | "dashboard";
}
