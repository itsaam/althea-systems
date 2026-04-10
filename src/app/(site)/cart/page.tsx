"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CartItem from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const SHIPPING_COST = 9.9;

export default function CartPage() {
  const router = useRouter();
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();
  const t = useTranslations("cart");

  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const grandTotal = total + shipping;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl md:mb-8 md:text-4xl">
        {t("title")}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">{t("empty")}</p>
          <Button asChild>
            <Link href="/">{t("continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {t("itemCount", { count: itemCount })}
              </p>
              <Button variant="ghost" onClick={clearCart}>
                {t("clear")}
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
              actionLabel={t("proceedToCheckout")}
              onActionClick={handleCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
