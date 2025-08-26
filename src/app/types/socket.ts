// types/socket.ts - Updated with proper typing

import { Order } from "@prisma/client";

export interface ServerToClientEvents {
  hello: (data: string) => void;
  pong: (data: string) => void;
  connectionStatus: (data: {
    connected: boolean;
    clientsCount: number;
  }) => void;

  newOrder: (data: {
    orderId: string;
    tableId: string;
    tableName: string; // Make this required
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
    tableId: string;
    timestamp: Date;
  }) => void;

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

  billCreated: (data: { billId: string; totalAmount: number }) => void;

  // Fixed tableCheckedOut event type
  tableCheckedOut: (data: {
    tableId: string;
    totalAmount: number;
    orders: Order[];
    number: string;
    tableName: string; // Make this required
    timestamp: string; // Add timestamp for deduplication
  }) => void;

  checkoutConfirmed: (data: {
    tableId: string;
    message: string;
    timestamp: Date;
  }) => void;

  ordersUpdated: (orders: Order[]) => void;
}

export interface ClientToServerEvents {
  hello: (data: string) => void;
  ping: () => void;

  // Room management
  joinTable: (tableId: string) => void;
  leaveTable: (tableId: string) => void;
  joinDashboard: () => void;
  leaveDashboard: () => void;

  orderStatusUpdated: (data: {
    orderId: string;
    status: string;
    tableId: string;
    timestamp: Date;
  }) => void;

  // Order management
  orderStatusUpdate: (data: {
    orderId: string;
    status: string;
    tableId: string;
  }) => void;

  // Fixed checkoutTable event type
  checkoutTable: (data: {
    tableId: string;
    totalAmount: number;
    orders: Order[];
    number: string;
    tableName: string; // Make this required
    timestamp: string; // Add timestamp for deduplication
  }) => void;
}

export interface SocketData {
  userId?: string;
  tableId: string;
  role?: "customer" | "dashboard";
}
