"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentMethods() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Bientôt disponible
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight md:text-2xl">
              Enregistrez vos cartes en toute sécurité
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pour simplifier vos futurs achats, vous pourrez bientôt
              enregistrer vos moyens de paiement dans un coffre-fort chiffré
              géré par Stripe. Aucune donnée bancaire n&apos;est stockée sur
              nos serveurs.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Paiement par carte</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Visa, Mastercard, American Express — disponibles dès le
                    checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Virement bancaire</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pour les commandes professionnelles, sur facture 30 jours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <div
              className="relative aspect-[1.6/1] w-full max-w-[280px] overflow-hidden rounded-xl bg-gradient-to-br from-[#003d5c] via-[#00628f] to-[#00a3c4] p-5 text-white shadow-lg"
              aria-hidden="true"
            >
              <div className="absolute inset-0 opacity-[0.08]" style={{
                backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }} />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                    Althea Pay
                  </span>
                  <CreditCard className="h-6 w-6 opacity-80" />
                </div>
                <div>
                  <p className="font-mono text-sm tracking-wider opacity-90">
                    •••• •••• •••• 4242
                  </p>
                  <div className="mt-2 flex items-end justify-between text-[10px] uppercase tracking-wider opacity-70">
                    <span>Titulaire</span>
                    <span>12 / 28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold">
            Aucun moyen de paiement enregistré
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Vous pourrez toujours payer en carte bancaire lors du checkout
            sécurisé Stripe, sans enregistrer votre carte si vous le souhaitez.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/products">
              Parcourir le catalogue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p>
          Tous les paiements transitent via <strong>Stripe</strong>, certifié
          PCI DSS niveau 1. Vos informations bancaires sont chiffrées
          end-to-end et ne touchent jamais nos serveurs.
        </p>
      </div>
    </div>
  );
}
