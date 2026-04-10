import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "Créez votre compte Althea Systems en moins de 2 minutes et accédez au catalogue professionnel d'équipements médicaux.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Nouveau compte
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Créer votre compte
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Rejoignez Althea Systems et profitez d&apos;un accès complet au
          catalogue, de tarifs professionnels et d&apos;un historique de
          commandes détaillé.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
