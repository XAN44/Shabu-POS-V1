import { useState } from "react";
import {
  CartItem,
  CartItemAddon,
  MenuItem,
  SelectedAddon,
} from "../app/types/menu";

type ModalMenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image: string | null;
  imageKey: string | null;
  available: boolean;
  addons?: {
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
    available: boolean;
  }[];
};

interface UseMenuItemModalProps {
  cart: CartItem[];
  updateCart: (newCart: CartItem[]) => void;
}

export function useMenuItemModal({ cart, updateCart }: UseMenuItemModalProps) {
  const [selectedItem, setSelectedItem] = useState<ModalMenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  const openItemModal = (item: MenuItem) => {
    const modalItem: ModalMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description ?? null,
      image: item.image ?? null,
      imageKey: item.imageKey ?? null,
      available: item.available,
      addons: item.addons,
    };
    setSelectedItem(modalItem);
    setQuantity(1);
    setSelectedAddons([]);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    // คำนวณราคาของ addons ที่เลือก
    const addonsPrice = selectedAddons.reduce(
      (sum, selected) => sum + selected.addon.price * selected.quantity,
      0
    );

    // คำนวณ subtotal รวม addons
    const subtotal = (selectedItem.price + addonsPrice) * quantity;

    const menuItemForCart: MenuItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      category: selectedItem.category,
      description: selectedItem.description ?? undefined,
      image: selectedItem.image ?? undefined,
      imageKey: selectedItem.imageKey ?? undefined,
      available: selectedItem.available,
      addons: selectedItem.addons,
    };

    // แปลง SelectedAddon เป็น CartItemAddon
    const cartAddons: CartItemAddon[] = selectedAddons.map((selected) => ({
      id: selected.addon.id,
      name: selected.addon.name,
      price: selected.addon.price,
      quantity: selected.quantity,
    }));

    const cartItem: CartItem = {
      menuItemId: selectedItem.id,
      quantity,
      menuItem: menuItemForCart,
      subtotal,
      selectedAddons: cartAddons.length > 0 ? cartAddons : undefined,
    };

    updateCart([...cart, cartItem]);
    setSelectedItem(null);
    setSelectedAddons([]);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedAddons([]);
  };

  const updateSelectedAddons = (newSelectedAddons: SelectedAddon[]) => {
    setSelectedAddons(newSelectedAddons);
  };

  return {
    selectedItem,
    quantity,
    selectedAddons,
    setQuantity,
    updateSelectedAddons,
    openItemModal,
    addToCart,
    closeModal,
  };
}
