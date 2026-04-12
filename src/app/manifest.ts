import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Althea Systems — Équipement médical de pointe",
    short_name: "Althea",
    description:
      "Althea Systems sélectionne, certifie et livre le matériel médical de pointe qui équipe les professionnels de santé. ISO 13485, marquage CE, livraison 48h.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f1f2",
    theme_color: "#0e090c",
    lang: "fr-FR",
    dir: "ltr",
    categories: ["medical", "shopping", "business"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/og/home.png",
        sizes: "1200x630",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
