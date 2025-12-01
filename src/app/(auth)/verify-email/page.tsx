"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  // Succès de la vérification
  if (success === "true") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Email vérifié !</h1>
        <p className="text-muted-foreground">
          Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant
          vous connecter.
        </p>
        <Link href="/login">
          <Button className="mt-4">Se connecter</Button>
        </Link>
      </div>
    );
  }

  // Erreur
  if (error) {
    const errorMessages: Record<string, string> = {
      missing_token: "Le lien de vérification est incomplet.",
      invalid_token: "Ce lien de vérification est invalide ou a expiré.",
      user_not_found: "Utilisateur non trouvé.",
      server_error: "Une erreur serveur est survenue.",
    };

    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Erreur de vérification</h1>
        <p className="text-muted-foreground">
          {errorMessages[error] || "Une erreur est survenue."}
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/register">
            <Button variant="outline">S&apos;inscrire à nouveau</Button>
          </Link>
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  // État par défaut - En attente de vérification
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Vérifiez votre email</h1>
      <p className="text-muted-foreground">
        Nous avons envoyé un email de vérification à votre adresse. Cliquez sur
        le lien dans l&apos;email pour activer votre compte.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg mt-6">
        <p className="text-sm text-muted-foreground">
          <strong>Vous n&apos;avez pas reçu l&apos;email ?</strong>
          <br />
          Vérifiez vos spams ou{" "}
          <button className="text-primary hover:underline">
            renvoyez l&apos;email de vérification
          </button>
        </p>
      </div>
      <Link href="/login">
        <Button variant="outline" className="mt-4">
          Retour à la connexion
        </Button>
      </Link>
    </div>
  );
}
