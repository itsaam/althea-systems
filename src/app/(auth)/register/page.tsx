import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "Créez votre compte Althea Systems en moins de 2 minutes et accédez au catalogue professionnel d'équipements médicaux.",
};

export default async function RegisterPage() {
  const t = await getTranslations("auth.registerPage");

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
      <RegisterForm />
    </div>
  );
}
