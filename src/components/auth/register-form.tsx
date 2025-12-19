"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";

// Icônes OAuth
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validation
    if (data.password !== data.confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || "Erreur lors de l'inscription");
        return;
      }

      // Afficher le message de vérification d'email
      setRegisteredEmail(data.email);
      setEmailSent(true);
      toast.success("Vérifiez votre boîte mail pour activer votre compte !");
    } catch {
      setFormError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setFormError(null);
    
    signIn(provider, { callbackUrl: "/" }).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`OAuth ${provider} error:`, err);
      }
      setFormError(`Erreur de connexion ${provider}. Vérifiez que le provider est configuré.`);
      setIsLoading(false);
    });
  };

  // Si l'email a été envoyé, afficher le message de confirmation
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Vérifiez votre boîte mail !
          </h2>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Un email de confirmation a été envoyé à :<br />
            <strong>{registeredEmail}</strong>
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Cliquez sur le lien dans l&apos;email pour activer votre compte.
            <br />
            Le lien expire dans 24 heures.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas reçu l&apos;email ?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              setEmailSent(false);
              setFormError(null);
            }}
          >
            Réessayer
          </button>
        </p>
        <Link href="/login" className="text-primary hover:underline text-sm">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Boutons OAuth */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span className="ml-2">Continuer avec Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          <GitHubIcon />
          <span className="ml-2">Continuer avec GitHub</span>
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          ou
        </span>
      </div>

      {/* Formulaire d'inscription */}
      <form onSubmit={handleRegister} className="space-y-4">
        {formError && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Jean"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Dupont"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jean@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Inscription..." : "S'inscrire"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
