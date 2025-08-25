import {
  DashboardApiResponse,
  CurrentMetrics,
  MetricsItem,
} from "@/src/app/types/Order";

export function mapDashboardToCurrentMetrics(
  data: DashboardApiResponse
): CurrentMetrics {
  const sales: MetricsItem = {
    value: data.totalRevenue.toLocaleString(),
  };

  const tables: MetricsItem = {
    value: (data.occupiedTables + data.availableTables).toString(),
    utilization:
      (data.occupiedTables / (data.occupiedTables + data.availableTables)) *
      100,
  };

  const orders: MetricsItem = {
    value: data.totalOrders.toString(),
    newOrders: data.newOrders,
  };

  const activeOrders: MetricsItem = {
    value: data.preparingOrders.toString(),
    inKitchen: data.preparingOrders,
    readyToServe: data.readyOrders,
  };

  return { sales, tables, orders, activeOrders };
}
