"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Minus, Plus, ArrowUpRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  image?: string;
  disabled?: boolean;
}

/**
 * Action card — style éditorial cohérent avec le reste du site :
 * - Qty stepper : boutons carrés outline, chiffre mono tabular
 * - CTA principal : full-width, black-on-white, hover invert
 * Aucun aplat primary (electric-indigo).
 */
export default function AddToCartButton({
  productId,
  productName,
  price,
  image,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const t = useTranslations("product");

  const handleAddToCart = () => {
    if (disabled) return;
    addItem(
      {
        id: productId,
        name: productName,
        price,
        image,
      },
      quantity
    );

    toast.success(t("addedToCart", { count: quantity }));
    setQuantity(1);
  };

  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : q));
  const increase = () => setQuantity((q) => q + 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Qty stepper — mono outline, pas de border radius */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/40">
          {t("qtyShort")}
        </span>
        <div className="flex items-center">
          <button
            type="button"
            onClick={decrease}
            disabled={quantity <= 1 || disabled}
            aria-label={t("decreaseQuantity")}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/60 bg-background text-foreground/70 transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span
            className="inline-flex h-8 w-10 items-center justify-center border-y border-border/60 bg-background font-mono text-[12px] tabular-nums text-foreground"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={increase}
            disabled={disabled}
            aria-label={t("increaseQuantity")}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/60 bg-background text-foreground/70 transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* CTA primaire — full-width black-on-white éditorial */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled}
        className="group/cta inline-flex h-10 w-full items-center justify-between gap-3 border border-foreground bg-background px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-background disabled:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      >
        <span>{disabled ? t("outOfStock") : t("addToCart")}</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
      </button>
    </div>
  );
}
