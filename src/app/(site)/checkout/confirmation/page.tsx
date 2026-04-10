"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Package, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
              Commande confirmée !
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Merci pour votre confiance. Votre commande a bien été
              enregistrée.
            </p>
          </div>

          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Référence commande
              </p>
              <p className="mt-1 font-mono text-lg font-semibold">
                {orderRef || "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Date : {new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Prochaines étapes
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3 rounded-lg border p-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Email de confirmation</p>
                    <p className="text-muted-foreground">
                      Vous recevrez un récapitulatif détaillé par email d&apos;ici
                      quelques minutes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Préparation & expédition</p>
                    <p className="text-muted-foreground">
                      Votre commande sera préparée sous 24-48h ouvrées. Vous
                      recevrez un email dès son expédition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isGuest && (
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
                <p className="font-medium">Suivez votre commande plus facilement</p>
                <p className="mt-1 text-muted-foreground">
                  Créez un compte avec la même adresse email pour accéder à
                  l&apos;historique, au suivi et aux factures.
                </p>
                <Button asChild variant="link" className="mt-1 h-auto p-0">
                  <Link href="/register">Créer un compte →</Link>
                </Button>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href={isGuest ? "/" : "/orders"}>
                  {isGuest ? "Retour à l'accueil" : "Voir mes commandes"}
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/products">Continuer mes achats</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
