import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à votre compte Althea Systems pour accéder à vos commandes, adresses et moyens de paiement.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Bon retour
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Connexion à votre compte
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Accédez à vos commandes, adresses et factures en quelques clics.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
