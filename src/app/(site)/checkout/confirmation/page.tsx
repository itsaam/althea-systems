"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Mail, Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderRef, setOrderRef] = useState<string>("");

  const isGuest = searchParams.get("guest") === "1";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    clearCart();
    const ref =
      sessionId ??
      `ALT-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    setOrderRef(ref);
  }, [clearCart, sessionId]);

  return (
    <div className="bg-background text-foreground">
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1400px] items-center justify-center px-4 py-24 sm:px-6 lg:px-10">
          <div className="w-full max-w-[640px]">
            {/* Index marker */}
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              <span>— Checkout · Confirmation</span>
              <span className="tabular-nums">Ref · {orderRef || "—"}</span>
            </div>

            {/* Main card */}
            <div className="mt-6 border border-border/60 bg-background">
              {/* Success header */}
              <div className="border-b border-border/60 px-8 py-10 text-center md:px-12 md:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-foreground bg-foreground text-background">
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <h1 className="mt-8 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground md:text-[40px]">
                  Commande confirmée
                  <span
                    aria-hidden
                    className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
                  />
                </h1>
                <p className="mt-4 text-[14px] leading-relaxed text-foreground/60">
                  Merci pour votre confiance. Votre commande a bien été
                  enregistrée.
                </p>
              </div>

              {/* Reference */}
              <div className="border-b border-border/60 px-8 py-6 md:px-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                  Référence commande
                </p>
                <p className="mt-2 font-mono text-[18px] font-medium tabular-nums text-foreground">
                  {orderRef || "—"}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  {new Date().toLocaleDateString("fr-FR", {
                    dateStyle: "long",
                  })}
                </p>
              </div>

              {/* Next steps */}
              <div className="space-y-4 px-8 py-8 md:px-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  — Prochaines étapes
                </p>

                <div className="flex gap-4 border border-border/60 p-5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" strokeWidth={1.5} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                      Email de confirmation
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
                      Récapitulatif détaillé envoyé d&apos;ici quelques minutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border border-border/60 p-5">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" strokeWidth={1.5} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                      Préparation & expédition
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
                      Commande préparée sous 24-48h ouvrées. Notification
                      dès expédition.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest upsell */}
              {isGuest && (
                <div className="border-t border-dashed border-border/60 px-8 py-6 md:px-12">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                    Suivez votre commande
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
                    Créez un compte avec la même adresse email pour accéder au
                    suivi, à l&apos;historique et aux factures.
                  </p>
                  <Link
                    href="/register"
                    className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground transition-colors hover:text-foreground/60"
                  >
                    Créer un compte →
                  </Link>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-border/60 p-8 sm:flex-row md:p-12">
                <Link
                  href={isGuest ? "/" : "/orders"}
                  className="group/cta inline-flex h-11 flex-1 items-center justify-between gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
                >
                  <span>
                    {isGuest ? "Retour à l'accueil" : "Mes commandes"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex h-11 flex-1 items-center justify-center border border-border/60 px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:border-foreground hover:text-foreground"
                >
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
