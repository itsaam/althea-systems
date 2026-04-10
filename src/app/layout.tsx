import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import SessionProvider from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/cookie-banner";
import { getDirection } from "@/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
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
  keywords: [
    "equipement medical",
    "materiel medical",
    "dispositif medical",
    "Althea Systems",
    "professionnel de sante",
  ],
  authors: [{ name: "Althea Systems" }],
  creator: "Althea Systems",
  publisher: "Althea Systems",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "Althea Systems",
    title: "Althea Systems - Equipement medical de pointe",
    description:
      "Decouvrez notre gamme complete d'equipements medicaux pour les professionnels de sante.",
    images: [
      {
        url: `${BASE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Althea Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Althea Systems - Equipement medical de pointe",
    description:
      "Equipements medicaux de haute qualite pour les professionnels de sante.",
    images: [`${BASE_URL}/images/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
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
        className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} ${instrumentSerif.variable} antialiased`}
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
