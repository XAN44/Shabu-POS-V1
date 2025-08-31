// types/menu.ts

// จากโค้ดของคุณ
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  imageKey?: string;
  addons?: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available: boolean;
}

export interface SelectedAddon {
  addon: Addon;
  quantity: number;
}

export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
  selectedAddons?: CartItemAddon[];
  notes?: string;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  orderTime: Date;
  items: {
    id?: string;
    menuItem: MenuItem;
    quantity: number;
    addons?: CartItemAddon[];
  }[];
}

export interface BillSummary {
  orders: Order[];
  totalAmount: number;
  itemsCount: number;
}

export interface OrderInput {
  tableId?: string;
  items: OrderItem[];
  notes?: string;
  customerName?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  option?: string;
  notes?: string;
  selectedAddons?: SelectedAddon[];
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

// จากโค้ด AI (เพิ่ม type ที่ยังไม่มีในโค้ดของคุณ)
export interface MenuAddon {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  available: boolean;
}
