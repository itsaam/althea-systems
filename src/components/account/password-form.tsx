"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Eye, EyeOff, Info, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PasswordStrengthMeter, {
  isPasswordValid,
} from "./password-strength-meter";

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_STATE: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [form, setForm] = useState<PasswordFormState>(INITIAL_STATE);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setHasPassword(data.user.hasPassword);
        }
      })
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  const confirmMatches =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const newPasswordValid = isPasswordValid(form.newPassword);
  const canSubmit =
    form.currentPassword.length > 0 && newPasswordValid && confirmMatches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!confirmMatches) {
      setFormError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!newPasswordValid) {
      setFormError("Le mot de passe ne respecte pas toutes les règles");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Mot de passe mis à jour", {
        description: "Votre nouveau mot de passe est actif.",
        icon: <ShieldCheck className="h-4 w-4" />,
      });
      setForm(INITIAL_STATE);
    } catch {
      setFormError("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasPassword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Sécurité du compte
          </CardTitle>
          <CardDescription>
            Vous êtes connecté via un fournisseur externe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-muted-foreground">
              Aucun mot de passe n&apos;est associé à ce compte. Votre
              authentification est gérée par Google ou GitHub. Pour modifier vos
              identifiants, rendez-vous sur leur plateforme respective.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>
          Utilisez un mot de passe unique que vous n&apos;employez pas ailleurs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  showCurrent
                    ? "Masquer le mot de passe actuel"
                    : "Afficher le mot de passe actuel"
                }
                tabIndex={-1}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  showNew
                    ? "Masquer le nouveau mot de passe"
                    : "Afficher le nouveau mot de passe"
                }
                tabIndex={-1}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.newPassword.length > 0 && (
              <PasswordStrengthMeter value={form.newPassword} className="pt-2" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                autoComplete="new-password"
                className={cn(
                  "pr-10",
                  form.confirmPassword.length > 0 &&
                    !confirmMatches &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  showConfirm
                    ? "Masquer la confirmation"
                    : "Afficher la confirmation"
                }
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.confirmPassword.length > 0 && (
              <p
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  confirmMatches ? "text-emerald-600" : "text-destructive"
                )}
              >
                {confirmMatches ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Les mots de passe correspondent
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Les mots de passe ne correspondent pas
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end border-t pt-5">
            <Button
              type="submit"
              disabled={isSaving || !canSubmit}
              className="h-10"
            >
              {isSaving ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Mise à jour…
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  Changer le mot de passe
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
