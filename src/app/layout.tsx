import type { Metadata } from "next";
import {
  Inter,
  Poppins,
  IBM_Plex_Mono,
  Newsreader,
  Noto_Sans_Arabic,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import SessionProvider from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/cookie-banner";
import { getDirection } from "@/i18n";

// ──────────────────────────────────────────────────────────────
// Althea typography (conforme charte graphique CDC §IV)
// Heading — Poppins semibold (titres)
// Body    — Inter Regular    (corps)
// Mono    — IBM Plex Mono    (eyebrows, metadata, tabular numerics)
// Serif   — Newsreader       (rare editorial italic accent)
// Arabic  — Noto Sans Arabic (RTL parity)
// ──────────────────────────────────────────────────────────────

const sans = Inter({
  variable: "--font-sans-brand",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const heading = Poppins({
  variable: "--font-heading-brand",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif-brand",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Althea Systems - Equipement medical de pointe",
    template: "%s | Althea Systems",
  },
  description:
    "Althea Systems propose une gamme complete d'equipements medicaux de haute qualite pour les professionnels de sante. Livraison rapide, prix competitifs.",
  applicationName: "Althea Systems",
  keywords: [
    "Althea",
    "Althea Systems",
    "Althea Systems France",
    "equipement medical",
    "materiel medical",
    "dispositif medical",
    "professionnel de sante",
    "e-commerce medical",
    "imagerie medicale",
    "autoclave",
    "defibrillateur",
    "moniteur patient",
  ],
  authors: [{ name: "Althea Systems", url: BASE_URL }],
  creator: "Althea Systems",
  publisher: "Althea Systems",
  category: "Medical Equipment",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US", "ar"],
    url: BASE_URL,
    siteName: "Althea Systems",
    title: "Althea Systems - Equipement medical de pointe",
    description:
      "Decouvrez notre gamme complete d'equipements medicaux pour les professionnels de sante.",
    images: [
      {
        url: `https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/og/home.png`,
        width: 1200,
        height: 630,
        alt: "Althea Systems — L'équipement médical, repensé.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@altheasystems",
    creator: "@altheasystems",
    title: "Althea Systems - Equipement medical de pointe",
    description:
      "Equipements medicaux de haute qualite pour les professionnels de sante.",
    images: [`https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev/og/home.png`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr-FR": BASE_URL,
      "en-US": BASE_URL,
      ar: BASE_URL,
      "x-default": BASE_URL,
    },
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
  verification: {
    // Remplir avec les tokens réels une fois les services connectés :
    // Google : https://search.google.com/search-console
    // Bing   : https://www.bing.com/webmasters
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#00111a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${sans.variable} ${heading.variable} ${mono.variable} ${serif.variable} ${notoArabic.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            {children}
            <CookieBanner />
            <Toaster />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
