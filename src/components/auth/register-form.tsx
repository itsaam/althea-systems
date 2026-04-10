"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import PasswordStrengthMeter, {
  isPasswordValid,
} from "./password-strength-meter";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword" | "terms", string>
>;

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
          result?.error ??
            "Erreur lors de l'inscription. Veuillez réessayer."
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

  if (emailSent) {
    return (
      <div className="space-y-6 text-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-900/50 dark:bg-emerald-950/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-200">
              Vérifiez votre boîte mail
            </h2>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80">
              Un email de confirmation a été envoyé à
            </p>
            <p className="font-mono text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              {registeredEmail}
            </p>
            <p className="pt-2 text-xs text-emerald-700/80 dark:text-emerald-300/60">
              Cliquez sur le lien dans l&apos;email pour activer votre compte.
              Le lien expire dans 24 heures.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 text-sm">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => {
              setEmailSent(false);
              setFormError(null);
            }}
          >
            Utiliser un autre email
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span className="ml-2 font-medium">S&apos;inscrire avec Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          <GitHubIcon />
          <span className="ml-2 font-medium">S&apos;inscrire avec GitHub</span>
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ou avec votre email
        </span>
      </div>

      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Jean"
              autoComplete="given-name"
              required
              disabled={isLoading}
              aria-invalid={!!fieldErrors.firstName}
              onChange={() => clearFieldError("firstName")}
              className={fieldErrors.firstName ? "border-destructive" : ""}
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Dupont"
              autoComplete="family-name"
              required
              disabled={isLoading}
              aria-invalid={!!fieldErrors.lastName}
              onChange={() => clearFieldError("lastName")}
              className={fieldErrors.lastName ? "border-destructive" : ""}
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email professionnel</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jean@cabinet-medical.fr"
            autoComplete="email"
            required
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            onChange={() => clearFieldError("email")}
            className={fieldErrors.email ? "border-destructive" : ""}
          />
          {fieldErrors.email && (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
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
              className={
                fieldErrors.password ? "border-destructive pr-10" : "pr-10"
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <PasswordStrengthMeter value={password} />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
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
              className={
                fieldErrors.confirmPassword
                  ? "border-destructive pr-10"
                  : "pr-10"
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                showConfirmPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-destructive">
              {fieldErrors.confirmPassword}
            </p>
          )}
          {confirmPassword.length > 0 &&
            confirmPassword === password &&
            !fieldErrors.confirmPassword && (
              <p className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Les mots de passe correspondent
              </p>
            )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(checked === true);
                clearFieldError("terms");
              }}
              disabled={isLoading}
              aria-invalid={!!fieldErrors.terms}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground"
            >
              J&apos;accepte les{" "}
              <Link
                href="/cgu"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link
                href="/mentions-legales"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                politique de confidentialité
              </Link>{" "}
              d&apos;Althea Systems.
            </Label>
          </div>
          {fieldErrors.terms && (
            <p className="text-xs text-destructive">{fieldErrors.terms}</p>
          )}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Création du compte...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Créer mon compte
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
