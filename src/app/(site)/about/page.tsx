import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos — Althea Systems",
  description:
    "Althea Systems distribue des équipements médicaux sélectionnés avec exigence pour les professionnels de santé européens depuis 2011.",
  alternates: { canonical: "/about" },
};

const STATS = [
  { value: "2011", label: "Fondé à Lyon" },
  { value: "4 800", label: "Praticiens équipés" },
  { value: "48H", label: "Livraison garantie" },
  { value: "ISO\u00A013485", label: "Certification" },
];

const MILESTONES = [
  {
    year: "2011",
    title: "Fondation",
    description:
      "Quatre ingénieurs biomédicaux et deux praticiens ouvrent le premier entrepôt Althea à Lyon. Dix références, un comité de sélection, zéro concession.",
  },
  {
    year: "2015",
    title: "ISO 13485",
    description:
      "Certification internationale pour les dispositifs médicaux. Le catalogue s'élargit à l'imagerie diagnostique et aux consommables de chirurgie.",
  },
  {
    year: "2019",
    title: "Europe",
    description:
      "Hubs logistiques en Belgique puis en Allemagne. Support multilingue, tarifs professionnels paneuropéens, intégrations ERP hospitalières.",
  },
  {
    year: "2023",
    title: "Plateforme",
    description:
      "Refonte complète du e-commerce : commandes récurrentes, devis en ligne, historique structure, traçabilité de bout en bout.",
  },
  {
    year: "2026",
    title: "Aujourd'hui",
    description:
      "Plus de 4 000 références, 80 collaborateurs, une équipe commerciale terrain dans six pays. Indépendants, toujours.",
  },
];

const VALUES = [
  {
    index: "01",
    title: "Exigence clinique",
    body: "Chaque produit passe par notre comité médical avant référencement. CE, IVDR, MDR, ISO 13485 : non négociables.",
  },
  {
    index: "02",
    title: "Proximité terrain",
    body: "Une équipe qui parle le langage des soignants. Interlocuteurs dédiés, visites sur site, support humain sous 24h.",
  },
  {
    index: "03",
    title: "Innovation mesurée",
    body: "Nous référençons des technologies éprouvées, pas des gadgets. Fiabilité opérationnelle avant promesse marketing.",
  },
  {
    index: "04",
    title: "Logistique maîtrisée",
    body: "Stock européen multi-sites, livraison 48h garantie, traçabilité bout en bout. Les urgences sont traitées en priorité.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-24 lg:pt-32">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
              Althea Systems — About · FR
            </p>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40 tabular-nums sm:block">
              Index · 005 / About
            </p>
          </div>

          <h1 className="mt-16 font-display text-hero leading-[0.88] tracking-[-0.035em] text-foreground lg:mt-24">
            Depuis 2011<span className="text-electric-indigo-500">.</span>
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 lg:grid-cols-12">
            <p className="text-lead text-foreground/70 lg:col-span-6 lg:col-start-1">
              Althea Systems est un distributeur européen d&apos;équipements
              médicaux indépendant, fondé par des professionnels de santé.
              Nous sélectionnons, certifions et livrons uniquement ce que nous
              utiliserions nous-mêmes.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-5 lg:col-start-8 lg:justify-end">
              <Link
                href="/categories"
                className="rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-electric-indigo-500"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-foreground/20 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                Parler à un conseiller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border/60 pt-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <span className="font-display text-3xl leading-none tabular-nums tracking-[-0.02em] whitespace-nowrap text-foreground sm:text-4xl">
                  {s.value}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Histoire ────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Histoire · 001 / Méthode
              </p>
              <h2 className="mt-4 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground">
                Une maison,
                <br />
                pas un marketplace
                <span className="text-electric-indigo-500">.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-5 text-body text-foreground/75 lg:col-span-6 lg:col-start-7">
              <p>
                Althea Systems est née d&apos;un constat simple : les
                professionnels de santé perdaient un temps considérable à
                chercher, comparer et qualifier les équipements dont ils
                avaient besoin au quotidien. Nos fondateurs, tous issus du
                milieu biomédical, ont voulu construire un intermédiaire de
                confiance, à taille humaine.
              </p>
              <p>
                Contrairement aux marketplaces généralistes, nous ne
                référençons pas tout ce qui existe. Chaque fabricant passe par
                un processus d&apos;évaluation clinique et logistique. Chaque
                produit est testé par notre comité. Nous assumons des choix —
                et nous tenons à les expliquer.
              </p>
              <p>
                En quinze ans, nous sommes devenus l&apos;un des partenaires
                de référence des cabinets, cliniques et hôpitaux en France et
                en Europe. Toujours à taille humaine, toujours indépendants,
                toujours financés par nos propres ventes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valeurs ─────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Valeurs · 002 / Principes
              </p>
              <h2 className="mt-4 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground">
                Quatre principes
                <br />
                non négociables
                <span className="text-electric-indigo-500">.</span>
              </h2>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 border-t border-border/60 pt-12 md:grid-cols-2">
            {VALUES.map((v) => (
              <article
                key={v.index}
                className="group flex flex-col gap-4 border-t border-border/40 pt-8 first:border-t-0 first:pt-0 md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(2)]:pt-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] tabular-nums text-foreground/40 group-hover:text-electric-indigo-500">
                    {v.index} / 04
                  </span>
                </div>
                <h3 className="font-display text-h3 leading-[1.05] tracking-[-0.02em] text-foreground">
                  {v.title}
                </h3>
                <p className="max-w-md text-body text-foreground/70">
                  {v.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <section className="relative isolate grain overflow-hidden border-b border-border/60">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                Parcours · 003 / Timeline
              </p>
              <h2 className="mt-4 font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground">
                Quinze ans
                <br />
                d&apos;itération
                <span className="text-electric-indigo-500">.</span>
              </h2>
            </div>
          </div>

          <ol className="mt-16 border-t border-border/60">
            {MILESTONES.map((m, i) => (
              <li
                key={m.year}
                className="group grid grid-cols-1 gap-6 border-b border-border/40 py-10 transition-colors hover:bg-foreground/[0.015] md:grid-cols-12 md:gap-10"
              >
                <div className="flex items-baseline gap-4 md:col-span-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40">
                    {String(i + 1).padStart(2, "0")} / {MILESTONES.length}
                  </span>
                  <span className="font-display text-2xl tabular-nums tracking-[-0.02em] text-foreground group-hover:text-electric-indigo-500 md:text-3xl">
                    {m.year}
                  </span>
                </div>
                <h3 className="font-display text-h3 leading-[1.05] tracking-[-0.02em] text-foreground md:col-span-4">
                  {m.title}
                </h3>
                <p className="text-body text-foreground/70 md:col-span-5">
                  {m.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Certifications / CTA final ──────────────────────────── */}
      <section className="relative isolate grain overflow-hidden">
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-start gap-10 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
            Certifications · 004 / Standards
          </p>
          <h2 className="max-w-5xl font-display text-h1 leading-[1] tracking-[-0.03em] text-foreground">
            Des standards européens,
            <br />
            pas des promesses
            <span className="text-electric-indigo-500">.</span>
          </h2>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/60 pt-6">
            {[
              "CE",
              "IVDR",
              "MDR",
              "ISO 13485",
              "ISO 9001",
              "Made in EU",
            ].map((spec) => (
              <span
                key={spec}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/60"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-electric-indigo-500"
            >
              Nous contacter
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center rounded-full border border-foreground/20 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
