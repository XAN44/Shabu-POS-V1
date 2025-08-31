import { Order } from "@/src/app/types/Order";

export const getAverageWaitTime = (todayOrders: Order[]): number => {
  const activeOrders = todayOrders.filter((o) =>
    ["new", "preparing", "ready"].includes(o.status)
  );

  if (activeOrders.length === 0) return 0;

  const totalMinutes = activeOrders.reduce((sum, order) => {
    const orderTime = new Date(order.orderTime);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );
    return sum + diffMinutes;
  }, 0);

  return Math.round(totalMinutes / activeOrders.length);
};
