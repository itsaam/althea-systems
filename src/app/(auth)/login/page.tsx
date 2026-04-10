import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à votre compte Althea Systems pour accéder à vos commandes, adresses et moyens de paiement.",
};

export default async function LoginPage() {
  const t = await getTranslations("auth.loginPage");

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
