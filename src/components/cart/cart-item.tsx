"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Minus, Plus, X } from "lucide-react";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  index?: number;
  total?: number;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
  index,
  total,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const t = useTranslations("cart");
  const lineTotal = price * quantity;
  const ref =
    typeof index === "number" && typeof total === "number"
      ? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
      : null;

  return (
    <article className="grid grid-cols-[88px_1fr] items-start gap-5 py-8 sm:grid-cols-[120px_1fr_auto] sm:gap-8">
      {/* Image */}
      <div className="relative aspect-square w-[88px] overflow-hidden bg-foreground/[0.04] ring-1 ring-inset ring-border/60 sm:w-[120px]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="120px"
            className="object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 bg-foreground/[0.04]" />
        )}
        {ref && (
          <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.22em] tabular-nums text-foreground/40">
            {ref}
          </span>
        )}
      </div>

      {/* Meta + qty */}
      <div className="min-w-0">
        <h3 className="truncate font-mono text-[12px] uppercase tracking-[0.14em] text-foreground">
          {name}
        </h3>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/50">
          Prix unité · {formatPrice(price)}
        </p>

        {/* Qty stepper */}
        <div className="mt-5 inline-flex items-center">
          <button
            type="button"
            onClick={() => onDecrease(id)}
            aria-label={t("decreaseQuantity", { name })}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/60 bg-background text-foreground/70 transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </button>
          <span
            className="inline-flex h-8 w-10 items-center justify-center border-y border-border/60 bg-background font-mono text-[12px] tabular-nums text-foreground"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease(id)}
            aria-label={t("increaseQuantity", { name })}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/60 bg-background text-foreground/70 transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Line total + remove — stacks below on mobile */}
      <div className="col-span-2 flex items-center justify-between border-t border-border/40 pt-5 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:self-stretch sm:border-0 sm:pt-0">
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            Total
          </p>
          <p className="mt-1 font-mono text-[16px] font-medium tabular-nums text-foreground">
            {formatPrice(lineTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={t("removeItemNamed", { name })}
          className="group/rm inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:text-destructive"
        >
          <X
            className="h-3 w-3 transition-transform duration-300 group-hover/rm:rotate-90"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{t("remove")}</span>
        </button>
      </div>
    </article>
  );
}
