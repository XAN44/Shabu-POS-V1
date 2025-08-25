import { Order } from "./Order";

export interface ServerToClientEvents {
  hello: (data: string) => void;
  pong: (data: string) => void;
  connectionStatus: (data: {
    connected: boolean;
    clientsCount: number;
  }) => void;

  // Order-related events
  newOrder: (data: {
    orderId: string;
    tableId: string;
    totalAmount: number;
    itemsCount: number;
    customerName?: string;
    timestamp: Date;
  }) => void;

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

  // Table-related events - ADD MISSING EVENT
  tableStatusChanged: (data: {
    tableId: string;
    status: string;
    timestamp: Date;
  }) => void;

  // ADD MISSING tableOrdersUpdate EVENT
  tableOrdersUpdate: (data: {
    tableId: string;
    message: string;
    orders?: Order;
  }) => void;

  billCreated: (data: { billId: string; totalAmount: number }) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  ping: () => void;

  // Room management
  joinTable: (tableId: string) => void;
  leaveTable: (tableId: string) => void;
  joinDashboard: () => void;
  leaveDashboard: () => void;

  // Order events
  orderStatusUpdate: (data: {
    orderId: string;
    status: string;
    tableId: string;
  }) => void;

  // ADD MISSING EVENTS FROM YOUR SERVER CODE
  newOrderNotification: (data: {
    orderId: string;
    tableId: string;
    totalAmount: number;
    itemsCount: number;
    customerName?: string;
  }) => void;

  tableStatusUpdate: (data: { tableId: string; status: string }) => void;

  requestTableOrders: (tableId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  username?: string;
  tableId?: string;
  role?: "customer" | "dashboard";
}

// More specific event data types
export interface OrderStatusEvent {
  orderId: string;
  status: "new" | "preparing" | "ready" | "served" | "cancelled";
  timestamp: Date;
}

export interface TableStatusEvent {
  tableId: string;
  status: string;
  timestamp: Date;
}

export interface BillCreatedEvent {
  billId: string;
  totalAmount: number;
}

// More specific order status change event
export interface OrderStatusChangeEvent {
  orderId: string;
  status: "new" | "preparing" | "ready" | "served" | "cancelled";
  tableId: string;
  timestamp: Date;
}
