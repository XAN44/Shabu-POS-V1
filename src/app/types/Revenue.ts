// data/revenueData.ts
import { TimePeriod } from "../types/typesChart";

export interface RevenueMetrics {
  sales: {
    value: string;
    trend: string;
    isPositive: boolean;
  };
  tables: {
    value: string;
    trend: string;
    utilization: number;
  };
  orders: {
    value: string;
    trend: string;
    newOrders: number;
  };
  activeOrders: {
    value: string;
    trend: string;
    inKitchen: number;
    readyToServe: number;
  };
}

export type RevenueDataByPeriod = Record<TimePeriod, RevenueMetrics>;

export const revenueData: RevenueDataByPeriod = {
  today: {
    sales: {
      value: "฿ 15,350",
      trend: "+12.5% จากเมื่อวาน",
      isPositive: true,
    },
    tables: {
      value: "8/15",
      trend: "อัตราใช้งาน 53%",
      utilization: 53,
    },
    orders: {
      value: "68",
      trend: "15 ออเดอร์ใหม่",
      newOrders: 15,
    },
    activeOrders: {
      value: "5",
      trend: "ในครัว 3, พร้อมเสิร์ฟ 2",
      inKitchen: 3,
      readyToServe: 2,
    },
  },
  thisWeek: {
    sales: {
      value: "฿ 192,000",
      trend: "+8.2% จากสัปดาห์ที่แล้ว",
      isPositive: true,
    },
    tables: {
      value: "285/420",
      trend: "อัตราใช้งาน 68%",
      utilization: 68,
    },
    orders: {
      value: "425",
      trend: "เฉลี่ย 61 ออเดอร์/วัน",
      newOrders: 61,
    },
    activeOrders: {
      value: "12",
      trend: "เฉลี่ยรออัพเดต 8 นาที",
      inKitchen: 8,
      readyToServe: 4,
    },
  },
  thisMonth: {
    sales: {
      value: "฿ 835,000",
      trend: "+15.3% จากเดือนที่แล้ว",
      isPositive: true,
    },
    tables: {
      value: "1,240/1,860",
      trend: "อัตราใช้งาน 67%",
      utilization: 67,
    },
    orders: {
      value: "1,856",
      trend: "เฉลี่ย 62 ออเดอร์/วัน",
      newOrders: 62,
    },
    activeOrders: {
      value: "18",
      trend: "Peak time 12:00-14:00",
      inKitchen: 12,
      readyToServe: 6,
    },
  },
  thisYear: {
    sales: {
      value: "฿ 13,200,000",
      trend: "+22.7% จากปีที่แล้ว",
      isPositive: true,
    },
    tables: {
      value: "15,680/22,320",
      trend: "อัตราใช้งาน 70%",
      utilization: 70,
    },
    orders: {
      value: "24,580",
      trend: "เฉลี่ย 67 ออเดอร์/วัน",
      newOrders: 67,
    },
    activeOrders: {
      value: "45",
      trend: "เดือนที่ดีที่สุด ธ.ค.",
      inKitchen: 28,
      readyToServe: 17,
    },
  },
};
