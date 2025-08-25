// types/analytics.ts
export type TimePeriod = "today" | "thisWeek" | "thisMonth" | "thisYear";

export interface MetricsItem {
  value: string;
  trend: string;
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

export interface Analysis {
  totalDays: number;
  avgRevenuePerDay: number;
  avgOrdersPerDay: number;
}

export interface AdditionalStats {
  avgOrderValue: number;
  completionRate: number;
  pendingOrders: number;
}

export interface RawStats {
  totalRevenue: number;
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  readyOrders: number;
  servedOrders: number;
}

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  utilization: number;
}

export interface AnalyticsResponse {
  period: TimePeriod;
  currentMetrics: CurrentMetrics;
  analysis: Analysis | null;
  additionalStats: AdditionalStats;
  rawData: {
    currentStats: RawStats;
    previousStats: Partial<RawStats>;
    tableStats: TableStats;
  };
  meta: {
    dateRange: {
      start: string;
      end: string;
    };
    generatedAt: string;
  };
}

// Types สำหรับ API Request/Response
export interface AnalyticsRequest {
  period: TimePeriod;
}

// Types สำหรับ Chart data (ถ้าต้องการเพิ่มในอนาคต)
export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface TrendData {
  current: number;
  previous: number;
  percentChange: number;
  isPositive: boolean;
}

// Helper types
export interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}
