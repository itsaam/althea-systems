import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CheckoutForm from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const t = await getTranslations("checkout.page");

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
              <Link
                href="/cart"
                className="transition-colors hover:text-foreground"
              >
                Panier
              </Link>
              <span aria-hidden="true" className="text-foreground/30">
                ·
              </span>
              <span className="text-foreground">Checkout</span>
            </nav>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 009 / Payment
            </p>
          </div>

          <h1 className="mt-14 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground lg:mt-20">
            {t("title")}
            <span className="text-electric-indigo-500">.</span>
          </h1>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-y-4 border-t border-border/60 pt-8">
            <p className="max-w-xl text-[14px] leading-relaxed text-foreground/60">
              {t("subtitle")}
            </p>
            <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
              <span>Paiement sécurisé · Stripe</span>
              <span>SSL · PCI-DSS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <CheckoutForm />
        </div>
      </section>
    </div>
  );
}
