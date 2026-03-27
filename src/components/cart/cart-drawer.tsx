"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetDescription,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// import CartItem from "@/components/cart/cart-item"; // TODO: Uncomment when implementing cart items
import CartSummary from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

const SHIPPING_COST = 9.9;

export default function CartDrawer() {
  const { items, total, itemCount, removeItem, updateQuantity } = useCart();

  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const grandTotal = total + shipping;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="sr-only">Panier</span>
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? "Votre panier est vide"
              : `${itemCount} article${itemCount > 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun article dans le panier.</div>
            ) : (
              items.map((item) => (
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
              ))
            )}
          </div>
          <div className="mt-auto pt-4">
            <CartSummary
              subtotal={total}
              shipping={shipping}
              total={grandTotal}
              actionLabel={itemCount === 0 ? "Panier vide" : "Passer au checkout"}
              actionDisabled={itemCount === 0}
            />
            {itemCount > 0 ? (
              <Button asChild variant="outline" className="w-full mt-3">
                <Link href="/cart">Voir le panier</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
