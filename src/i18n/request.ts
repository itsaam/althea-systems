import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { i18nConfig, type Locale } from "./config";

function parseAcceptLanguage(
  acceptLanguage: string | null
): Locale | undefined {
  if (!acceptLanguage) return undefined;
  const preferred = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase().substring(0, 2))
    .find((lang) => i18nConfig.locales.includes(lang as Locale));
  return preferred as Locale | undefined;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;
  const headerLocale = parseAcceptLanguage(headersList.get("Accept-Language"));

  let locale: Locale = i18nConfig.defaultLocale;
  if (cookieLocale && i18nConfig.locales.includes(cookieLocale)) {
    locale = cookieLocale;
  } else if (headerLocale) {
    locale = headerLocale;
  }

  const messages = (await import(`./locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
