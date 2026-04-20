"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, ShieldCheck, Truck } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  actionLabel?: string;
  actionDisabled?: boolean;
  onActionClick?: () => void;
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

export default function CartSummary({
  subtotal,
  shipping,
  total,
  actionLabel,
  actionDisabled = false,
  onActionClick,
}: CartSummaryProps) {
  const t = useTranslations("cart");
  const label = actionLabel ?? t("placeOrder");

  return (
    <div className="border border-border/60 bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          — {t("summary")}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums">
          Ref · 008
        </p>
      </header>

      {/* Lines */}
      <dl className="space-y-4 px-6 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
            {t("subtotal")}
          </dt>
          <dd className="font-mono text-[13px] tabular-nums text-foreground">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
            {t("shipping")}
          </dt>
          <dd className="font-mono text-[13px] tabular-nums text-foreground">
            {shipping === 0 ? (
              <span className="uppercase tracking-[0.18em] text-foreground/60">
                {t("free")}
              </span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>
      </dl>

      {/* Total */}
      <div className="border-t border-border/60 px-6 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">
            {t("total")}
          </p>
          <p className="font-mono text-[22px] font-medium tabular-nums text-foreground">
            {formatPrice(total)}
          </p>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/40">
          TTC · TVA incluse
        </p>
      </div>

      {/* CTA */}
      <div className="border-t border-border/60 p-6">
        <button
          type="button"
          onClick={onActionClick}
          disabled={actionDisabled}
          className="group/cta inline-flex h-11 w-full items-center justify-between gap-3 border border-foreground bg-background px-5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border/60 disabled:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <span>{label}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </button>
      </div>

      {/* Trust marks */}
      <div className="border-t border-border/60 px-6 py-5">
        <ul className="space-y-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          <li className="flex items-center gap-3">
            <ShieldCheck className="h-3 w-3 text-foreground/60" />
            {t("securePayment")}
          </li>
          <li className="flex items-center gap-3">
            <Truck className="h-3 w-3 text-foreground/60" />
            {t("deliveryMetropolitan")}
          </li>
        </ul>
      </div>
    </div>
  );
}
