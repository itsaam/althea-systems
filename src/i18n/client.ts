"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";

export const useTranslations = useNextIntlTranslations;

export function useLocale() {
  // Hook pour récupérer la locale actuelle côté client
  if (typeof window !== "undefined") {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="))
        ?.split("=")[1] || "fr"
    );
  }
  return "fr";
}

export function setLocale(locale: string) {
  // Définir la locale dans un cookie
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
  // Recharger la page pour appliquer le changement
  window.location.reload();
}
