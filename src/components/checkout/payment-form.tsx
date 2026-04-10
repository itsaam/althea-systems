"use client";

import { useState } from "react";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue(method);
      }}
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMethod("stripe")}
          className={cn(
            "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            method === "stripe"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/60"
          )}
          aria-pressed={method === "stripe"}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              method === "stripe"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">Carte bancaire</p>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#1434CB] shadow-sm">
                  VISA
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#EB001B] shadow-sm">
                  MC
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Paiement sécurisé via Stripe. Vos données ne transitent jamais
              par nos serveurs.
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Paiement 100 % sécurisé</p>
          <p className="text-xs text-muted-foreground">
            Chiffrement SSL 256-bit, conformité PCI-DSS niveau 1. Vos
            informations bancaires sont traitées directement par Stripe,
            certifié par les autorités bancaires européennes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          La saisie des informations de carte aura lieu sur la page
          sécurisée Stripe après confirmation de votre commande.
        </span>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button type="submit">Continuer vers la confirmation</Button>
      </div>
    </form>
  );
}
