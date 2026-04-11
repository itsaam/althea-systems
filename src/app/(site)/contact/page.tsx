import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Althea Systems : conseil commercial, devis, SAV et partenariats. Réponse sous 24 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

const COORDINATES = [
  {
    label: "Téléphone",
    primary: "+33 (0)4 72 00 00 00",
    detail: "Lun — Ven · 09h — 18h",
    href: "tel:+33472000000",
  },
  {
    label: "Commercial",
    primary: "contact@althea-systems.com",
    detail: "Réponse sous 24h ouvrées",
    href: "mailto:contact@althea-systems.com",
  },
  {
    label: "Support SAV",
    primary: "support@althea-systems.com",
    detail: "Livraison · maintenance · retours",
    href: "mailto:support@althea-systems.com",
  },
];

const ADDRESS_LINES = [
  "Althea Systems SAS",
  "42 rue de la Santé",
  "69003 Lyon — France",
];

const HOURS = [
  { day: "Lun — Jeu", value: "09h — 18h" },
  { day: "Vendredi", value: "09h — 17h" },
  { day: "Sam — Dim", value: "Fermé" },
];

const SPECS = [
  "SAV 7j/7",
  "Lun — Ven · 09h — 19h",
  "Réponse < 24h",
  "ISO 13485",
];

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-24 lg:pt-32">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
              Althea Systems — Contact · FR
            </p>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 004 / Contact
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-12">
            <h1 className="font-display text-hero leading-[0.88] tracking-[-0.035em] text-foreground lg:col-span-12">
              Un vrai humain
              <span className="text-electric-indigo-500">.</span>
              <br className="hidden sm:block" />
              Pas un formulaire.
            </h1>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 lg:grid-cols-12">
            <p className="text-lead text-foreground/70 lg:col-span-6 lg:col-start-1">
              Cabinet, clinique, centre de soins ou hôpital — notre équipe
              commerciale vous répond directement, sans chatbot ni ticket
              anonyme.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-5 lg:col-start-8 lg:justify-end">
              {SPECS.map((spec) => (
                <span
                  key={spec}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial body : coords + form ──────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-10">
            {/* ── Left : editorial coordinates ──────────────────── */}
            <aside className="flex flex-col gap-12 lg:col-span-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                  Coordonnées · 001 / Canaux
                </p>
                <h2 className="mt-4 font-display text-h2 leading-[1.02] tracking-[-0.025em] text-foreground">
                  Trois canaux.
                  <br />
                  Une réponse.
                </h2>
              </div>

              <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                {COORDINATES.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      className="group flex items-baseline justify-between gap-6 py-6 transition-colors hover:text-electric-indigo-500"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 group-hover:text-electric-indigo-500/70">
                          {c.label}
                        </span>
                        <span className="truncate font-display text-lg tracking-[-0.01em] text-foreground group-hover:text-electric-indigo-500 sm:text-xl">
                          {c.primary}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                          {c.detail}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-electric-indigo-500"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                    Siège social
                  </p>
                  <address className="not-italic font-mono text-xs leading-relaxed text-foreground/80">
                    {ADDRESS_LINES.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                    Horaires
                  </p>
                  <dl className="flex flex-col gap-1">
                    {HOURS.map((row) => (
                      <div
                        key={row.day}
                        className="flex items-baseline justify-between gap-3 font-mono text-xs tabular-nums text-foreground/80"
                      >
                        <dt className="text-foreground/50">{row.day}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <p className="max-w-sm border-t border-border/60 pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-foreground/50">
                Vos données sont traitées dans le strict respect du RGPD.{" "}
                <Link
                  href="/legal/privacy"
                  className="text-foreground underline-offset-4 hover:underline hover:text-electric-indigo-500"
                >
                  Confidentialité
                </Link>
                .
              </p>
            </aside>

            {/* ── Right : form ──────────────────────────────────── */}
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="border-t border-border/60 pt-10 lg:border-0 lg:pt-0">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
