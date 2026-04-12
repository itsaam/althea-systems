"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LogIn, UserCheck, UserPlus } from "lucide-react";

interface AuthStepProps {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string | null;
  onContinueAuthenticated: () => void;
  onContinueGuest: () => void;
}

export default function AuthStep({
  isAuthenticated,
  userName,
  userEmail,
  onContinueAuthenticated,
  onContinueGuest,
}: AuthStepProps) {
  const router = useRouter();
  const currentPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/checkout";

  // ── Authenticated ─────────────────────────────────────
  if (isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="border border-border/60 bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border/60">
              <UserCheck
                className="h-4 w-4 text-foreground/70"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                Session active
              </p>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-foreground">
                {userName || "Utilisateur connecté"}
              </p>
              {userEmail && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                  {userEmail}
                </p>
              )}
              <p className="mt-4 text-[13px] leading-relaxed text-foreground/60">
                Vos adresses et moyens de paiement enregistrés sont
                disponibles aux étapes suivantes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onContinueAuthenticated}
            className="group/cta inline-flex h-11 items-center gap-3 border border-foreground bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            Continuer
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Guest / not authenticated ──────────────────────────
  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Login card */}
        <button
          type="button"
          onClick={() =>
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
          }
          className="group/card flex flex-col items-start gap-4 border border-border/60 bg-background p-6 text-left transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <div className="flex h-11 w-11 items-center justify-center border border-border/60 transition-colors group-hover/card:border-foreground">
            <LogIn
              className="h-4 w-4 text-foreground/70 transition-colors group-hover/card:text-foreground"
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Option 01
            </p>
            <h3 className="mt-2 font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">
              J&apos;ai déjà un compte
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
              Retrouvez vos adresses, cartes enregistrées et historique de
              commande.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 transition-colors group-hover/card:text-foreground">
            Se connecter
            <ArrowUpRight
              className="h-3 w-3 transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </button>

        {/* Register card */}
        <button
          type="button"
          onClick={() =>
            router.push(
              `/register?callbackUrl=${encodeURIComponent(currentPath)}`
            )
          }
          className="group/card flex flex-col items-start gap-4 border border-border/60 bg-background p-6 text-left transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          <div className="flex h-11 w-11 items-center justify-center border border-border/60 transition-colors group-hover/card:border-foreground">
            <UserPlus
              className="h-4 w-4 text-foreground/70 transition-colors group-hover/card:text-foreground"
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Option 02
            </p>
            <h3 className="mt-2 font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">
              Créer un compte
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
              Suivi de commande, factures et achats simplifiés sur vos
              prochaines commandes.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 transition-colors group-hover/card:text-foreground">
            Créer un compte
            <ArrowUpRight
              className="h-3 w-3 transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
        <span className="px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
          Ou
        </span>
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
      </div>

      {/* Guest card */}
      <div className="border border-dashed border-border/60 bg-background p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
          Option 03 — Sans engagement
        </p>
        <h3 className="mt-3 font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">
          Continuer en tant qu&apos;invité
        </h3>
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-foreground/60">
          Commandez sans créer de compte. Vous pourrez toujours créer un
          compte après votre achat pour suivre votre commande.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onContinueGuest}
            className="group/guest inline-flex h-11 items-center gap-3 border border-border/60 bg-background px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70 transition-colors duration-300 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            Commander en invité
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/guest:-translate-y-0.5 group-hover/guest:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Legal footer */}
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        En continuant, vous acceptez nos{" "}
        <Link
          href="/cgu"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          CGV
        </Link>{" "}
        et notre{" "}
        <Link
          href="/mentions-legales"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
