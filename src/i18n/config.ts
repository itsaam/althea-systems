export const i18nConfig = {
  defaultLocale: "fr",
  locales: ["fr", "en", "ar"],
  localeDetection: true,
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];
