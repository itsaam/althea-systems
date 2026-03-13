"use client";

import Link from "next/link";
import CartItem from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const SHIPPING_COST = 9.9;

export default function CartPage() {
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();

  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const grandTotal = total + shipping;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Panier</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
          <Button asChild>
            <Link href="/">Continuer vos achats</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {itemCount} article{itemCount > 1 ? "s" : ""}
              </p>
              <Button variant="ghost" onClick={clearCart}>
                Vider le panier
              </Button>
            </div>

            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                image={item.image}
                onIncrease={(id) => {
                  const current = items.find((cartItem) => cartItem.id === id);
                  if (!current) return;
                  updateQuantity(id, current.quantity + 1);
                }}
                onDecrease={(id) => {
                  const current = items.find((cartItem) => cartItem.id === id);
                  if (!current) return;

                  if (current.quantity <= 1) {
                    removeItem(id);
                    return;
                  }

                  updateQuantity(id, current.quantity - 1);
                }}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div>
            <CartSummary
              subtotal={total}
              shipping={shipping}
              total={grandTotal}
              actionLabel="Passer au checkout"
            />
            <Button asChild variant="outline" className="w-full mt-3">
              <Link href="/checkout">Aller au checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
