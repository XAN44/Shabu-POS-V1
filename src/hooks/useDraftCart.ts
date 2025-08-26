"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { CartItem } from "../app/types/menu";
import { MenuItem } from "../app/types/Order";

// Define proper types for the API responses
interface DraftCartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  menuItem: MenuItem;
}

interface DraftCartResponse {
  id: string;
  tableId: string;
  items: DraftCartItem[];
  createdAt: string;
  updatedAt: string;
}

export function useDraftCart(
  tableId: string | null,
  tableValid: boolean | null
) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true); // เริ่มต้นด้วย true
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft cart เมื่อ component mount
  useEffect(() => {
    if (!tableId || tableValid === null) {
      console.log(
        "📦 Draft Cart: Skipping load - tableId:",
        tableId,
        "tableValid:",
        tableValid
      );
      setLoading(false);
      return;
    }

    if (tableValid === false) {
      console.log("📦 Draft Cart: Invalid table, clearing cart");
      setCart([]);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    console.log("📦 Draft Cart: Loading for table:", tableId);

    const loadDraftCart = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/draft-cart?tableId=${tableId}`, {
          cache: "no-cache", // ป้องกัน cache
        });

        console.log("📦 Draft Cart: API Response status:", response.status);

        if (response.ok) {
          const draftCart: DraftCartResponse | null = await response.json();
          console.log("📦 Draft Cart: Loaded data:", draftCart);

          if (draftCart?.items && draftCart.items.length > 0) {
            const cartItems: CartItem[] = draftCart.items.map(
              (item: DraftCartItem) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                menuItem: item.menuItem,
                subtotal: item.menuItem.price * item.quantity,
              })
            );
            console.log("📦 Draft Cart: Setting cart items:", cartItems.length);
            setCart(cartItems);
          } else {
            console.log("📦 Draft Cart: No items found, setting empty cart");
            setCart([]);
          }
        } else if (response.status === 404) {
          console.log(
            "📦 Draft Cart: No existing cart found (404) - starting with empty cart"
          );
          setCart([]);
        } else {
          console.error(
            "📦 Draft Cart: Error loading:",
            response.status,
            response.statusText
          );
          const errorData = await response.json().catch(() => null);
          console.error("📦 Draft Cart: Error details:", errorData);
          // กรณี error ก็ให้เริ่มต้นด้วย empty cart
          setCart([]);
        }
      } catch (error) {
        console.error("📦 Draft Cart: Exception loading:", error);
        // กรณี exception ก็ให้เริ่มต้นด้วย empty cart
        setCart([]);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadDraftCart();
  }, [tableId, tableValid]);

  // Save draft cart เมื่อ cart เปลี่ยน
  const saveDraftCart = useCallback(
    async (newCart: CartItem[]) => {
      if (!tableId || tableValid !== true || !isInitialized) {
        console.log(
          "Draft Cart: Skipping save - tableId:",
          tableId,
          "tableValid:",
          tableValid,
          "isInitialized:",
          isInitialized
        );
        return;
      }

      console.log("📦 Draft Cart: Saving cart with", newCart.length, "items");

      try {
        const items = newCart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        }));

        const response = await fetch("/api/draft-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableId, items }),
        });

        if (response.ok) {
          console.log("📦 Draft Cart: Saved successfully");
          const savedData = await response.json();
          console.log("📦 Draft Cart: Saved data:", savedData);
        } else {
          console.error(
            "📦 Draft Cart: Save failed with status:",
            response.status
          );
          const errorData = await response.json().catch(() => null);
          console.error("📦 Draft Cart: Error details:", errorData);
        }
      } catch (error) {
        console.error("📦 Draft Cart: Exception during save:", error);
      }
    },
    [tableId, tableValid, isInitialized]
  );

  // Update cart และ save with proper debouncing
  const updateCart = useCallback(
    (newCart: CartItem[]) => {
      console.log(
        "📦 Draft Cart: updateCart called with",
        newCart.length,
        "items"
      );
      setCart(newCart);

      // ถ้ายังไม่ได้ initialize แล้ว ไม่ต้อง save
      if (!isInitialized) {
        console.log("📦 Draft Cart: Not initialized yet, skipping save");
        return;
      }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        saveDraftCart(newCart);
      }, 300); // ลดเวลา debounce ลงเป็น 300ms
    },
    [saveDraftCart, isInitialized]
  );

  // Clear draft cart
  const clearDraftCart = useCallback(async () => {
    if (!tableId) return;

    try {
      console.log("📦 Draft Cart: Clearing cart for table:", tableId);

      // Clear any pending save operations
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const response = await fetch(`/api/draft-cart?tableId=${tableId}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 404) {
        // 404 is ok, means draft cart didn't exist
        console.log("📦 Draft Cart: Cart cleared successfully");
        setCart([]);
      } else {
        console.error("Error clearing draft cart:", response.statusText);
      }
    } catch (error) {
      console.error("Error clearing draft cart:", error);
    }
  }, [tableId]);

  // Add function to manually reload cart
  const reloadCart = useCallback(async () => {
    if (!tableId || tableValid !== true) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/draft-cart?tableId=${tableId}`, {
        cache: "no-cache",
      });

      if (response.ok) {
        const draftCart: DraftCartResponse | null = await response.json();
        if (draftCart?.items && draftCart.items.length > 0) {
          const cartItems: CartItem[] = draftCart.items.map(
            (item: DraftCartItem) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              menuItem: item.menuItem,
              subtotal: item.menuItem.price * item.quantity,
            })
          );
          setCart(cartItems);
        } else {
          setCart([]);
        }
      } else if (response.status === 404) {
        setCart([]);
      }
    } catch (error) {
      console.error("Error reloading cart:", error);
    } finally {
      setLoading(false);
    }
  }, [tableId, tableValid]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log("📦 Draft Cart State:", {
      cartLength: cart.length,
      loading,
      isInitialized,
      tableId,
      tableValid,
    });
  }, [cart.length, loading, isInitialized, tableId, tableValid]);

  return {
    cart,
    setCart, // Export setCart for direct updates that don't need saving
    updateCart,
    clearDraftCart,
    reloadCart, // Export reload function
    loading,
    isInitialized, // Export initialization state
  };
}

interface TableData {
  number: string;
}

export function useTableData(tableId: string | null) {
  const [tableData, setTableData] = useState<TableData | null>(null);

  useEffect(() => {
    if (!tableId) return;

    const fetchTableData = async () => {
      try {
        const res = await fetch(`/api/tables/${tableId}`);
        if (res.ok) {
          const data = await res.json();
          setTableData(data);
          if (Array.isArray(data)) {
            const found = data.find((t) => t.id === tableId);
            setTableData(found || null);
          } else {
            setTableData(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      }
    };

    fetchTableData();
  }, [tableId]);

  return tableData;
}
