// Export centralisé des utilitaires i18n
export { i18nConfig, type Locale } from "./config";
export { useTranslations, useLocale, setLocale } from "./client";

// Types pour les traductions
export type TranslationKey =
  | `common.${string}`
  | `product.${string}`
  | `cart.${string}`
  | `auth.${string}`
  | `footer.${string}`
  | `admin.${string}`
  | `errors.${string}`
  | `success.${string}`;

// Helper pour les directions RTL
export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

// Helper pour les formats de date selon la locale
export function getDateLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    fr: "fr-FR",
    en: "en-US",
    ar: "ar-SA",
  };
  return localeMap[locale] || "fr-FR";
}

// Helper pour le formatage des prix selon la locale
export function formatPrice(
  amount: number,
  locale: string,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat(getDateLocale(locale), {
    style: "currency",
    currency,
  }).format(amount);
}

// Helper pour le formatage des dates
export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    dateStyle: "medium",
    ...options,
  }).format(dateObj);
}
