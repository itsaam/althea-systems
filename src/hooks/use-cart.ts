"use client";

import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total } =
    useCartStore();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}
