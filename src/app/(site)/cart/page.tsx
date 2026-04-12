"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import CartItem from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/use-cart";

const SHIPPING_COST = 9.9;

export default function CartPage() {
  const router = useRouter();
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCart();
  const t = useTranslations("cart");

  const shipping = itemCount > 0 ? SHIPPING_COST : 0;
  const grandTotal = total + shipping;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-14 pt-24 sm:px-6 lg:px-10 lg:pb-20 lg:pt-32">
          <div className="flex flex-wrap items-center justify-between gap-y-3">
            <nav
              aria-label="Fil d'Ariane"
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50"
            >
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Accueil
              </Link>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <span className="text-foreground">Panier</span>
            </nav>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 008 / Checkout
            </p>
          </div>

          <h1 className="mt-14 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground lg:mt-20">
            {t("title")}
            <span className="text-electric-indigo-500">.</span>
          </h1>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-y-4 border-t border-border/60 pt-8">
            <p className="max-w-xl text-[14px] leading-relaxed text-foreground/60">
              Votre sélection avant validation. Modifiable jusqu&apos;au
              paiement. Livraison estimée sous 48h ouvrées en France
              métropolitaine.
            </p>
            <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 tabular-nums">
              <span>
                {String(itemCount).padStart(3, "0")}{" "}
                {itemCount > 1 ? "articles" : "article"}
              </span>
              <span>TTC · EUR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          {items.length === 0 ? (
            <div className="border-y border-border/60 py-24 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Panier · 000 / Vide
              </p>
              <p className="mt-4 text-body text-foreground/70">{t("empty")}</p>
              <Link
                href="/categories"
                className="group/back mt-8 inline-flex h-11 items-center gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
              >
                {t("continueShopping")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/back:-translate-y-0.5 group-hover/back:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
              {/* Items column */}
              <div>
                <div className="flex items-center justify-between border-t border-border/60 pb-6 pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 tabular-nums">
                    {t("itemCount", { count: itemCount })}
                  </p>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60 underline-offset-4 transition-colors hover:text-destructive hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    {t("clear")}
                  </button>
                </div>

                <ul className="divide-y divide-border/60 border-y border-border/60">
                  {items.map((item, index) => (
                    <li key={item.id}>
                      <CartItem
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        quantity={item.quantity}
                        image={item.image}
                        index={index}
                        total={items.length}
                        onIncrease={(id) => {
                          const current = items.find((ci) => ci.id === id);
                          if (!current) return;
                          updateQuantity(id, current.quantity + 1);
                        }}
                        onDecrease={(id) => {
                          const current = items.find((ci) => ci.id === id);
                          if (!current) return;
                          if (current.quantity <= 1) {
                            removeItem(id);
                            return;
                          }
                          updateQuantity(id, current.quantity - 1);
                        }}
                        onRemove={removeItem}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary column — sticky */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <CartSummary
                  subtotal={total}
                  shipping={shipping}
                  total={grandTotal}
                  actionLabel={t("proceedToCheckout")}
                  onActionClick={handleCheckout}
                />
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
