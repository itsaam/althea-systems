"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

/**
 * Stock chip — editorial: outline border, mono caps, colored status dot.
 * Colors align with Althea brand: success green, warning amber, destructive red.
 */
export default function StockBadge({ stock, className }: StockBadgeProps) {
  const t = useTranslations("product");

  if (stock === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-destructive/70 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-destructive backdrop-blur",
          className
        )}
      >
        <span aria-hidden className="h-1 w-1 rounded-full bg-destructive" />
        {t("outOfStock")}
      </span>
    );
  }

  if (stock < 5) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-warning/70 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-warning backdrop-blur",
          className
        )}
      >
        <span aria-hidden className="h-1 w-1 rounded-full bg-warning" />
        {t("lowStock")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none border border-success/40 bg-background/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-success backdrop-blur",
        className
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-success" />
      {t("inStock")}
    </span>
  );
}
