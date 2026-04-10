"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">
                Connecté{userName ? ` en tant que ${userName}` : ""}
              </p>
              {userEmail && (
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Vos adresses et cartes enregistrées seront disponibles aux
                étapes suivantes.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onContinueAuthenticated}>
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
          }
          className="group flex flex-col items-start gap-3 rounded-lg border p-5 text-left transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">J&apos;ai déjà un compte</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Retrouvez vos adresses, cartes et historique de commande.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/register?callbackUrl=${encodeURIComponent(currentPath)}`
            )
          }
          className="group flex flex-col items-start gap-3 rounded-lg border p-5 text-left transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">Créer un compte</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Suivi de commande, factures et achats simplifiés.
            </p>
          </div>
        </button>
      </div>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ou
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-5">
        <p className="font-semibold">Continuer en tant qu&apos;invité</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Commandez sans créer de compte. Vous pourrez toujours créer un
          compte après votre achat pour suivre votre commande.
        </p>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onContinueGuest}
          >
            Commander en invité
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        En continuant, vous acceptez nos{" "}
        <Link href="/cgu" className="underline hover:text-primary">
          conditions générales
        </Link>{" "}
        et notre{" "}
        <Link href="/mentions-legales" className="underline hover:text-primary">
          politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
