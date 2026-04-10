import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Althea Systems : conseil commercial, devis, SAV et partenariats. Réponse sous 24 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  const contactMethods = [
    {
      icon: Phone,
      label: t("methods.phone.label"),
      primary: "+33 (0)4 72 00 00 00",
      detail: t("methods.phone.detail"),
      href: "tel:+33472000000",
    },
    {
      icon: Mail,
      label: t("methods.emailSales.label"),
      primary: "contact@althea-systems.com",
      detail: t("methods.emailSales.detail"),
      href: "mailto:contact@althea-systems.com",
    },
    {
      icon: MessageCircle,
      label: t("methods.support.label"),
      primary: "support@althea-systems.com",
      detail: t("methods.support.detail"),
      href: "mailto:support@althea-systems.com",
    },
  ] as const;

  const hours = [
    { day: t("hours.weekdays"), value: "9h00 — 18h00" },
    { day: t("hours.friday"), value: "9h00 — 17h00" },
    { day: t("hours.weekend"), value: t("hours.closed") },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-[#003d5c] text-white">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="container relative py-16 md:py-20 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t("hero.eyebrow")}
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              {t.rich("hero.title", {
                em: (chunks) => (
                  <span className="italic text-white/80">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70 md:text-lg">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <aside className="space-y-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("reach.eyebrow")}
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                {t("reach.title")}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("reach.subtitle")}
              </p>
            </div>

            <ul className="space-y-4">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <li key={method.label}>
                    <a
                      href={method.href}
                      className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {method.label}
                        </p>
                        <p className="mt-0.5 break-words text-base font-semibold tracking-tight">
                          {method.primary}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {method.detail}
                        </p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("headquarters.label")}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed">
                    Althea Systems SAS
                    <br />
                    42 rue de la Santé
                    <br />
                    69003 Lyon, France
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("hours.label")}
                </p>
              </div>
              <dl className="space-y-1.5 text-sm">
                {hours.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-muted-foreground">{row.day}</dt>
                    <dd className="font-medium tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("rgpd.text")}{" "}
                <Link
                  href="/legal/privacy"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("rgpd.linkLabel")}
                </Link>
                .
              </p>
            </div>
          </aside>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
