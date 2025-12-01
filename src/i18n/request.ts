import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { i18nConfig, type Locale } from "./config";

export default getRequestConfig(async () => {
  // Récupérer la locale depuis les cookies ou headers
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. Vérifier le cookie de langue
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;

  // 2. Vérifier le header Accept-Language
  const acceptLanguage = headersList.get("Accept-Language");

  // 3. Déterminer la locale
  let locale: Locale = i18nConfig.defaultLocale;

  if (localeCookie && i18nConfig.locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else if (acceptLanguage) {
    // Parser Accept-Language pour trouver une correspondance
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2))
      .find((lang) => i18nConfig.locales.includes(lang as Locale));

    if (preferredLocale) {
      locale = preferredLocale as Locale;
    }
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
