"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

const URL_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Cet email est déjà utilisé avec une autre méthode de connexion.",
  CredentialsSignin: "Email ou mot de passe incorrect.",
  EmailNotVerified:
    "Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.",
  OAuthSignin: "Erreur de connexion OAuth. Vérifiez que le provider est configuré.",
  OAuthCallback: "Erreur de connexion OAuth. Vérifiez que le provider est configuré.",
  Configuration: "Erreur de configuration serveur. Contactez l'administrateur.",
};

const CREDENTIAL_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
  EMAIL_NOT_VERIFIED:
    "Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.",
  CredentialsSignin: "Email ou mot de passe incorrect",
};

const REMEMBER_STORAGE_KEY = "althea.auth.rememberEmail";

function readRememberedEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(REMEMBER_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

const FIELD_WRAPPER =
  "group relative border-b border-border/80 pb-2 transition-colors focus-within:border-primary";
const LABEL_CLASS =
  "block font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55";
const INPUT_CLASS =
  "mt-3 w-full border-0 bg-transparent p-0 text-[15px] text-foreground outline-none placeholder:text-foreground/30 focus:ring-0 disabled:opacity-50";
const OAUTH_BUTTON =
  "group inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border/70 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-all hover:border-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:hover:bg-transparent";
const SUBMIT_BUTTON =
  "group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground px-10 font-mono text-[12px] uppercase tracking-[0.22em] text-background transition-all hover:bg-foreground/90 disabled:opacity-60";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Hydrate remembered email after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    const remembered = readRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const submittedEmail = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email: submittedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setFormError(
          CREDENTIAL_ERROR_MESSAGES[result.error] ?? result.error
        );
        return;
      }

      if (result?.ok) {
        try {
          if (rememberMe) {
            window.localStorage.setItem(REMEMBER_STORAGE_KEY, submittedEmail);
          } else {
            window.localStorage.removeItem(REMEMBER_STORAGE_KEY);
          }
        } catch {
          // Storage unavailable (Safari private, etc.), ignore silently
        }

        router.push(result.url ?? callbackUrl);
        router.refresh();
      }
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

  const displayError =
    formError ?? (urlError ? URL_ERROR_MESSAGES[urlError] ?? `Erreur : ${urlError}` : null);

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
          <span>Continuer avec Google</span>
        </button>
        <button
          type="button"
          className={OAUTH_BUTTON}
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          <GitHubIcon />
          <span>Continuer avec GitHub</span>
        </button>
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
        <span className="h-px flex-1 bg-border/60" />
        <span>ou avec email</span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      {/* ── Credentials form ────────────────────────────── */}
      <form onSubmit={handleCredentialsLogin} className="space-y-8" noValidate>
        {displayError && (
          <div
            role="alert"
            className="border-l-2 border-destructive pl-4 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive"
          >
            {displayError}
          </div>
        )}

        {/* Email */}
        <div className={FIELD_WRAPPER}>
          <label htmlFor="email" className={LABEL_CLASS}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            placeholder="vous@exemple.fr"
          />
        </div>

        {/* Password */}
        <div className={FIELD_WRAPPER}>
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
            autoComplete="current-password"
            required
            disabled={isLoading}
            className={INPUT_CLASS}
            placeholder="••••••••"
          />
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between">
          <label className="group inline-flex cursor-pointer items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground">
            <span className="relative flex h-4 w-4 items-center justify-center border border-border/80 transition-colors group-hover:border-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="peer absolute inset-0 cursor-pointer opacity-0"
              />
              {rememberMe && (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 bg-foreground"
                />
              )}
            </span>
            <span>Se souvenir</span>
          </label>

          <Link
            href="/forgot-password"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-primary"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className={SUBMIT_BUTTON}>
          <span>{isLoading ? "Connexion…" : "Se connecter"}</span>
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
