import { useState } from "react";
import { toast } from "sonner";
import { CartItem, SelectedAddon } from "../app/types/menu";

// Define proper types matching the original code structure
interface NewOrder {
  id: string;
  tableId: string;
  status: string;
  totalAmount: number;
  orderTime: Date;
  items: {
    id: string;
    menuItemId: string;
    quantity: number;
    menuItem: {
      id: string;
      name: string;
      price: number;
      category: string;
      available: boolean;
      description?: string;
      image?: string;
      imageKey?: string;
    };
    addons?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

interface UseCartManagementProps {
  cart: CartItem[];
  updateCart: (newCart: CartItem[]) => void;
  tableId: string | null;
  clearDraftCart: () => Promise<void>;
  addNewOrder: (order: NewOrder) => void;
}

export function useCartManagement({
  cart,
  updateCart,
  tableId,
  clearDraftCart,
  addNewOrder,
}: UseCartManagementProps) {
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(false);

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = cart.map((item, i) => {
      if (i === index) {
        // คำนวณราคา addons ใหม่
        const addonsPrice = item.selectedAddons
          ? item.selectedAddons.reduce(
              (sum, addon) => sum + addon.price * addon.quantity,
              0
            )
          : 0;

        // คำนวณ subtotal ใหม่
        const newSubtotal = (item.menuItem.price + addonsPrice) * newQuantity;

        return {
          ...item,
          quantity: newQuantity,
          subtotal: newSubtotal,
        };
      }
      return item;
    });
    updateCart(newCart);
  };

  const submitOrder = async () => {
    if (!tableId || cart.length === 0) return;

    setLoading(true);
    try {
      const orderItems = cart.map((item) => {
        const selectedAddons: SelectedAddon[] = item.selectedAddons
          ? item.selectedAddons.map((addon) => ({
              addon: {
                id: addon.id,
                name: addon.name,
                price: addon.price,
                available: true,
              },
              quantity: addon.quantity,
            }))
          : [];

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedAddons,
        };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items: orderItems }),
      });

      if (!res.ok) throw new Error("Failed to submit order");
      const newOrder: NewOrder = await res.json();

      addNewOrder(newOrder);
      await clearDraftCart();

      setSubmittedOrder(true);
      setTimeout(() => setSubmittedOrder(false), 3000);
      toast.success("สั่งอาหารสำเร็จ!");
    } catch (err) {
      console.error("Error submitting order:", err);
      toast.error("เกิดข้อผิดพลาดในการสั่งอาหาร");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submittedOrder,
    removeFromCart,
    updateCartItemQuantity,
    submitOrder,
  };
}
