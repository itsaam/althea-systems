"use client";

import Link from "next/link";

export default function PaymentMethods() {
  return (
    <div className="space-y-14">
      {/* Bloc intro */}
      <section className="grid gap-10 border-t border-border/60 pt-10 md:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Bientôt disponible
          </p>
          <h2 className="mt-4 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[32px]">
            Enregistrez vos cartes en toute sécurité
            <span
              aria-hidden
              className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
            />
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-foreground/60">
            Pour simplifier vos futurs achats, vous pourrez bientôt enregistrer
            vos moyens de paiement dans un coffre-fort chiffré géré par Stripe.
            Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
          </p>

          <div className="mt-8 grid gap-px bg-border/60 sm:grid-cols-2">
            <div className="bg-background p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
                <span className="mr-1.5 opacity-60">—</span>
                Carte bancaire
              </p>
              <p className="mt-3 text-[14px] font-medium text-foreground">
                Visa, Mastercard, Amex
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-foreground/55">
                Disponibles dès le checkout.
              </p>
            </div>
            <div className="bg-background p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
                <span className="mr-1.5 opacity-60">—</span>
                Virement
              </p>
              <p className="mt-3 text-[14px] font-medium text-foreground">
                Pro · Facture 30 jours
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-foreground/55">
                Pour les commandes professionnelles.
              </p>
            </div>
          </div>
        </div>

        {/* Card preview */}
        <div className="shrink-0" aria-hidden="true">
          <div className="relative aspect-[1.6/1] w-full max-w-[280px] overflow-hidden border border-border/60 bg-background p-5">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                  Althea Pay
                </span>
                <span className="border border-border/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/70">
                  Visa
                </span>
              </div>
              <div>
                <p className="font-mono text-[14px] tabular-nums tracking-wider text-foreground">
                  •••• •••• •••• 4242
                </p>
                <div className="mt-3 flex items-end justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">
                  <span>Titulaire</span>
                  <span className="tabular-nums">12 / 28</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty state */}
      <section className="border-t border-border/60 pt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="mr-1.5 opacity-60">—</span>
          Aucun moyen enregistré
        </p>
        <h3 className="mt-4 font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
          Aucune carte pour le moment
        </h3>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-foreground/60">
          Vous pourrez toujours payer en carte bancaire lors du checkout
          sécurisé Stripe, sans enregistrer votre carte si vous le souhaitez.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-border/60 bg-background px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground"
        >
          Explorer le catalogue
        </Link>
      </section>

      {/* Stripe security notice */}
      <section className="border-l-2 border-border/60 pl-5 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
          Sécurité
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">
          Tous les paiements transitent via{" "}
          <span className="font-medium text-foreground">Stripe</span>, certifié
          PCI DSS niveau 1. Vos informations bancaires sont chiffrées
          end-to-end et ne touchent jamais nos serveurs.
        </p>
      </section>
    </div>
  );
}
