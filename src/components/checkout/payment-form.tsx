"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  selected: "stripe" | null;
  onBack: () => void;
  onContinue: (method: "stripe") => void;
}

export default function PaymentForm({
  selected,
  onBack,
  onContinue,
}: PaymentFormProps) {
  const [method, setMethod] = useState<"stripe">(selected ?? "stripe");

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue(method);
      }}
    >
      {/* Payment option */}
      <button
        type="button"
        onClick={() => setMethod("stripe")}
        className={cn(
          "flex w-full items-start gap-5 border bg-background p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
          method === "stripe"
            ? "border-foreground"
            : "border-border/60 hover:border-foreground/60"
        )}
        aria-pressed={method === "stripe"}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border/60">
          <CreditCard className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">
              Carte bancaire
            </p>
            <div className="flex items-center gap-2">
              <span className="border border-border/60 bg-background px-2 py-0.5 font-mono text-[9px] font-medium tabular-nums text-foreground/60">
                VISA
              </span>
              <span className="border border-border/60 bg-background px-2 py-0.5 font-mono text-[9px] font-medium tabular-nums text-foreground/60">
                MC
              </span>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
            Paiement sécurisé via Stripe. Vos données ne transitent jamais
            par nos serveurs.
          </p>
        </div>
      </button>

      {/* Security notice */}
      <div className="border border-dashed border-border/60 bg-background p-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" strokeWidth={1.5} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
              Paiement 100 % sécurisé
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
              Chiffrement SSL 256-bit, conformité PCI-DSS niveau 1. Vos
              informations bancaires sont traitées directement par Stripe,
              certifié par les autorités bancaires européennes.
            </p>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        <Lock className="h-3 w-3" />
        Saisie de la carte sur page sécurisée Stripe après confirmation.
      </p>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="h-11 px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline">
          ← Retour
        </button>
        <button type="submit" className="group/cta inline-flex h-11 items-center gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2">
          Continuer
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}
