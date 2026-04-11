"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import PasswordStrengthMeter, {
  isPasswordValid,
} from "./password-strength-meter";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="h-4 w-4"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

type FieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "password" | "confirmPassword" | "terms",
    string
  >
>;

const FIELD_WRAPPER =
  "group relative border-b border-border/80 pb-2 transition-colors focus-within:border-electric-indigo-500";
const FIELD_WRAPPER_ERROR =
  "group relative border-b border-destructive pb-2 transition-colors";
const LABEL_CLASS =
  "block font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55";
const INPUT_CLASS =
  "mt-3 w-full border-0 bg-transparent p-0 text-[15px] text-foreground outline-none placeholder:text-foreground/30 focus:ring-0 disabled:opacity-50";
const ERROR_LINE =
  "mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive";
const OAUTH_BUTTON =
  "group inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border/70 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-all hover:border-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:hover:bg-transparent";
const SUBMIT_BUTTON =
  "group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground px-10 font-mono text-[12px] uppercase tracking-[0.22em] text-background transition-all hover:bg-foreground/90 disabled:opacity-60";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    const errors: FieldErrors = {};

    if (!firstName) errors.firstName = "Prénom requis";
    if (!lastName) errors.lastName = "Nom requis";
    if (!email) {
      errors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format d'email invalide";
    }
    if (!password) {
      errors.password = "Mot de passe requis";
    } else if (!isPasswordValid(password)) {
      errors.password =
        "Votre mot de passe ne respecte pas les règles de sécurité";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!acceptedTerms) {
      errors.terms = "Vous devez accepter les conditions générales";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(
          result?.error ?? "Erreur lors de l'inscription. Veuillez réessayer."
        );
        return;
      }

      setRegisteredEmail(email);
      setEmailSent(true);
      toast.success("Vérifiez votre boîte mail pour activer votre compte !");
    } catch {
      setFormError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setFormError(null);

    signIn(provider, { callbackUrl }).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`OAuth ${provider} error:`, err);
      }
      setFormError(
        `Erreur de connexion ${provider}. Vérifiez que le provider est configuré.`
      );
      setIsLoading(false);
    });
  };

  // ── Success state ───────────────────────────────────────
  if (emailSent) {
    return (
      <div role="status" aria-live="polite" className="space-y-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-indigo-500">
          — Email envoyé
        </p>

        <h2 className="font-display text-h3 leading-tight tracking-tight text-foreground">
          Vérifiez votre
          <br />
          boîte mail<span className="text-electric-indigo-500">.</span>
        </h2>

        <div className="space-y-3 border-l-2 border-border/60 pl-6">
          <p className="text-body text-foreground/70">
            Un email de confirmation vient d&apos;être envoyé à
          </p>
          <p className="font-mono text-[13px] text-foreground">
            {registeredEmail}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
            Lien actif pendant 24h
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 pt-8 font-mono text-[11px] uppercase tracking-[0.22em]">
          <button
            type="button"
            onClick={() => {
              setEmailSent(false);
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">↺</span>
            <span>Utiliser un autre email</span>
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-foreground/60 transition-colors hover:text-electric-indigo-500"
          >
            <span aria-hidden="true">←</span>
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────────
  return (
    <div className="space-y-10">
      {/* ── OAuth providers ─────────────────────────────── */}
      <div className="space-y-3">
        <button
          type="button"
          className={OAUTH_BUTTON}
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span>S&apos;inscrire avec Google</span>
        </button>
        <button
          type="button"
          className={OAUTH_BUTTON}
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          <GitHubIcon />
          <span>S&apos;inscrire avec GitHub</span>
        </button>
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
        <span className="h-px flex-1 bg-border/60" />
        <span>ou avec email</span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      {/* ── Credentials form ────────────────────────────── */}
      <form onSubmit={handleRegister} className="space-y-8" noValidate>
        {formError && (
          <div
            role="alert"
            className="border-l-2 border-destructive pl-4 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive"
          >
            {formError}
          </div>
        )}

        {/* First + last name */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div
              className={
                fieldErrors.firstName ? FIELD_WRAPPER_ERROR : FIELD_WRAPPER
              }
            >
              <label htmlFor="firstName" className={LABEL_CLASS}>
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                required
                disabled={isLoading}
                aria-invalid={!!fieldErrors.firstName}
                onChange={() => clearFieldError("firstName")}
                className={INPUT_CLASS}
                placeholder="Jean"
              />
            </div>
            {fieldErrors.firstName && (
              <p className={ERROR_LINE}>{fieldErrors.firstName}</p>
            )}
          </div>

          <div>
            <div
              className={
                fieldErrors.lastName ? FIELD_WRAPPER_ERROR : FIELD_WRAPPER
              }
            >
              <label htmlFor="lastName" className={LABEL_CLASS}>
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                required
                disabled={isLoading}
                aria-invalid={!!fieldErrors.lastName}
                onChange={() => clearFieldError("lastName")}
                className={INPUT_CLASS}
                placeholder="Dupont"
              />
            </div>
            {fieldErrors.lastName && (
              <p className={ERROR_LINE}>{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <div
            className={
              fieldErrors.email ? FIELD_WRAPPER_ERROR : FIELD_WRAPPER
            }
          >
            <label htmlFor="email" className={LABEL_CLASS}>
              Email professionnel
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              aria-invalid={!!fieldErrors.email}
              onChange={() => clearFieldError("email")}
              className={INPUT_CLASS}
              placeholder="jean@cabinet-medical.fr"
            />
          </div>
          {fieldErrors.email && <p className={ERROR_LINE}>{fieldErrors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div
            className={
              fieldErrors.password ? FIELD_WRAPPER_ERROR : FIELD_WRAPPER
            }
          >
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={LABEL_CLASS}>
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              aria-invalid={!!fieldErrors.password}
              className={INPUT_CLASS}
              placeholder="••••••••"
            />
          </div>
          <div className="mt-4">
            <PasswordStrengthMeter value={password} />
          </div>
          {fieldErrors.password && (
            <p className={ERROR_LINE}>{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <div
            className={
              fieldErrors.confirmPassword ? FIELD_WRAPPER_ERROR : FIELD_WRAPPER
            }
          >
            <div className="flex items-center justify-between">
              <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                Confirmer le mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              aria-invalid={!!fieldErrors.confirmPassword}
              className={INPUT_CLASS}
              placeholder="••••••••"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className={ERROR_LINE}>{fieldErrors.confirmPassword}</p>
          )}
          {confirmPassword.length > 0 &&
            confirmPassword === password &&
            !fieldErrors.confirmPassword && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-electric-indigo-500">
                ✓ Mots de passe identiques
              </p>
            )}
        </div>

        {/* Terms */}
        <div>
          <label className="group flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-border/80 transition-colors group-hover:border-foreground">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  clearFieldError("terms");
                }}
                disabled={isLoading}
                aria-invalid={!!fieldErrors.terms}
                className="peer absolute inset-0 cursor-pointer opacity-0"
              />
              {acceptedTerms && (
                <span aria-hidden="true" className="h-2 w-2 bg-foreground" />
              )}
            </span>
            <span className="text-[12px] leading-relaxed text-foreground/65">
              J&apos;accepte les{" "}
              <Link
                href="/cgu"
                target="_blank"
                className="text-foreground underline decoration-border/60 underline-offset-4 transition-colors hover:text-electric-indigo-500 hover:decoration-electric-indigo-500"
              >
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link
                href="/mentions-legales"
                target="_blank"
                className="text-foreground underline decoration-border/60 underline-offset-4 transition-colors hover:text-electric-indigo-500 hover:decoration-electric-indigo-500"
              >
                politique de confidentialité
              </Link>{" "}
              d&apos;Althea Systems.
            </span>
          </label>
          {fieldErrors.terms && (
            <p className={`${ERROR_LINE} ml-7`}>{fieldErrors.terms}</p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className={SUBMIT_BUTTON}>
          <span>
            {isLoading ? "Création du compte…" : "Créer mon compte"}
          </span>
          {!isLoading && (
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
