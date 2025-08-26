// types/menu.ts
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  imageKey?: string;
}

export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  orderTime: Date;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
}

export interface BillSummary {
  orders: Order[];
  totalAmount: number;
  itemsCount: number;
}

export interface SocketOrderData {
  orderId: string;
  tableId: string;
  totalAmount: number;
  itemsCount: number;
  customerName?: string;
  timestamp: Date;
}

export interface SocketStatusData {
  orderId: string;
  status: string;
  tableId?: string;
  timestamp: Date;
}
