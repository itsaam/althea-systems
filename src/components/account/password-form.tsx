"use client";

import { useEffect, useState } from "react";
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

const INPUT_BASE =
  "block w-full border-0 border-b border-border/60 bg-transparent px-0 py-3 text-[17px] text-foreground transition-colors placeholder:text-foreground/30 focus:border-foreground focus:outline-none focus:ring-0";
const LABEL_BASE =
  "block font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55";

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
        if (data?.user) {
          setHasPassword(Boolean(data.user.hasPassword));
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
        setFormError(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Mot de passe mis à jour", {
        description: "Votre nouveau mot de passe est actif.",
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
      <section aria-busy="true" className="space-y-4">
        <div className="h-3 w-48 animate-pulse rounded bg-foreground/5" />
        <div className="h-32 w-full animate-pulse rounded bg-foreground/5" />
      </section>
    );
  }

  if (!hasPassword) {
    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Sécurité
          </p>
          <p className="text-[16px] leading-relaxed text-foreground/65">
            Authentification gérée par un fournisseur externe.
          </p>
        </div>
        <div className="border-l-2 border-border/60 pl-6 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Connexion déléguée
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-foreground/70">
            Aucun mot de passe associé à ce compte. Votre authentification
            passe par Google ou GitHub. Modifiez vos identifiants sur leur
            plateforme respective.
          </p>
        </div>
      </section>
    );
  }

  const renderPasswordField = (
    id: keyof PasswordFormState,
    label: string,
    value: string,
    show: boolean,
    setShow: (v: boolean) => void,
    autoComplete: string,
    hasError = false
  ) => (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL_BASE}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
          autoComplete={autoComplete}
          className={cn(
            INPUT_BASE,
            "pr-12",
            hasError && "border-destructive focus:border-destructive"
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/50 hover:text-foreground"
          aria-label={show ? "Masquer" : "Afficher"}
          tabIndex={-1}
        >
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="mr-1.5 opacity-60">—</span>
          Sécurité
        </p>
        <p className="text-[16px] leading-relaxed text-foreground/65">
          Utilisez un mot de passe unique.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {formError && (
          <div
            role="alert"
            className="border-l-2 border-destructive pl-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive"
          >
            {formError}
          </div>
        )}

        {renderPasswordField(
          "currentPassword",
          "Mot de passe actuel",
          form.currentPassword,
          showCurrent,
          setShowCurrent,
          "current-password"
        )}

        <div className="space-y-3">
          {renderPasswordField(
            "newPassword",
            "Nouveau mot de passe",
            form.newPassword,
            showNew,
            setShowNew,
            "new-password"
          )}
          {form.newPassword.length > 0 && (
            <PasswordStrengthMeter value={form.newPassword} className="pt-2" />
          )}
        </div>

        {renderPasswordField(
          "confirmPassword",
          "Confirmer le mot de passe",
          form.confirmPassword,
          showConfirm,
          setShowConfirm,
          "new-password",
          form.confirmPassword.length > 0 && !confirmMatches
        )}

        {form.confirmPassword.length > 0 && (
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.16em]",
              confirmMatches ? "text-foreground/60" : "text-destructive"
            )}
          >
            {confirmMatches
              ? "Les mots de passe correspondent"
              : "Les mots de passe ne correspondent pas"}
          </p>
        )}

        <div className="flex items-center justify-end border-t border-border/60 pt-6">
          <button
            type="submit"
            disabled={isSaving || !canSubmit}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity",
              (isSaving || !canSubmit) && "opacity-40"
            )}
          >
            {isSaving ? "Mise à jour…" : "Changer le mot de passe"}
          </button>
        </div>
      </form>
    </section>
  );
}
