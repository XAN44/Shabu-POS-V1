// API Endpoints และค่าคงที่อื่นๆ
export const API_ENDPOINTS = {
  TABLES: "/api/tables",
  MENU: "/api/menu",
  ORDERS: "/api/orders",
  BILLS: "/api/bills",
} as const;

export const SOUND_CONFIG = {
  NEW_ORDER_VOLUME: 0.7,
  CHECKOUT_VOLUME: 0.7,
  STAFF_CALL_VOLUME: 0.8,
  STAFF_CALL_TIMEOUT: 60000, // 1 minute
  STAFF_CALL_LOOP_INTERVAL: 1000, // 1 second
} as const;

export const REFRESH_CONFIG = {
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  BACKGROUND_FETCH_DELAY: 100,
  CHECKOUT_FETCH_DELAY: 500,
} as const;
