// hooks/useMenuData.ts
import { useState, useEffect, useCallback } from "react";
import { MenuItem, Order } from "../app/types/menu";

export const useTableValidation = (tableId: string | null) => {
  const [tableValid, setTableValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!tableId) {
      setTableValid(false);
      return;
    }

    const checkTable = async () => {
      try {
        const res = await fetch(`/api/tables/${tableId}`);
        setTableValid(res.ok);
      } catch (err) {
        console.error("Failed to verify table:", err);
        setTableValid(false);
      }
    };

    checkTable();
  }, [tableId]);

  return tableValid;
};

export const useMenuData = (tableValid: boolean | null) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!tableValid) return;

    const fetchMenu = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data: MenuItem[] = await res.json();
        setMenuItems(data.filter((item) => item.available));
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMenu();
  }, [tableValid]);

  return { menuItems, fetchLoading };
};

export const useOrdersData = (tableId: string | null) => {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>(
    {}
  );

  const fetchOrders = useCallback(async () => {
    if (!tableId) return;

    try {
      const res = await fetch(`/api/orders/${tableId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data: Order[] = await res.json();
      setMyOrders(data);

      const newStatuses: Record<string, string> = {};
      data.forEach((order) => {
        newStatuses[order.id] = order.status;
      });
      setOrderStatuses(newStatuses);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [tableId]);

  useEffect(() => {
    if (tableId) {
      fetchOrders();
    }
  }, [tableId, fetchOrders]);

  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: status }));
    setMyOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);

  const addNewOrder = useCallback((newOrder: Order) => {
    setMyOrders((prev) => [...prev, newOrder]);
    setOrderStatuses((prev) => ({ ...prev, [newOrder.id]: newOrder.status }));
  }, []);

  const removeOrdersById = useCallback((orderIds: string[]) => {
    setMyOrders((current) =>
      current.filter((order) => !orderIds.includes(order.id))
    );

    setOrderStatuses((current) => {
      const newStatuses = { ...current };
      orderIds.forEach((orderId) => {
        delete newStatuses[orderId];
      });
      return newStatuses;
    });
  }, []);

  return {
    myOrders,
    orderStatuses,
    fetchOrders,
    updateOrderStatus,
    addNewOrder,
    removeOrdersById,
  };
};
