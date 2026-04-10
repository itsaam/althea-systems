import { getTranslations } from "next-intl/server";
import CheckoutForm from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const t = await getTranslations("checkout.page");

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
}
