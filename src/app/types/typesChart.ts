export type TimePeriod = "today" | "thisWeek" | "thisMonth" | "thisYear";

export interface SalesData {
  labels: string[];
  values: number[];
}

export interface MenuData {
  name: string;
  quantity: number;
  color: string;
}

export interface ChartProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export interface SalesDataByPeriod {
  today: SalesData;
  thisWeek: SalesData;
  thisMonth: SalesData;
  thisYear: SalesData;
}

export interface MenuDataByPeriod {
  today: MenuData[];
  thisWeek: MenuData[];
  thisMonth: MenuData[];
  thisYear: MenuData[];
}
