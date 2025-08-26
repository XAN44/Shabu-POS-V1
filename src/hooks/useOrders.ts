"use client";
import { Order } from "@prisma/client";
import { useEffect, useState } from "react";

export function useOrders(tableId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!tableId) return;
    fetch(`/api/orders?tableId=${tableId}`)
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, [tableId]);

  return orders;
}
