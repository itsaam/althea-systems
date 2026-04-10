import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Award,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos d'Althea Systems",
  description:
    "Althea Systems distribue des équipements médicaux sélectionnés avec exigence pour les professionnels de santé européens depuis plus de 15 ans.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Exigence clinique",
    description:
      "Chaque produit est évalué par notre comité médical avant référencement. Certifications CE, IVDR et ISO 13485 non négociables.",
  },
  {
    icon: HeartPulse,
    title: "Proximité professionnelle",
    description:
      "Une équipe terrain qui parle le langage des soignants. Support sous 24h, SAV en France, interlocuteurs dédiés aux structures.",
  },
  {
    icon: Microscope,
    title: "Innovation mesurée",
    description:
      "Nous référençons des technologies éprouvées, pas des gadgets. L'intérêt du patient et la fiabilité opérationnelle avant tout.",
  },
  {
    icon: Truck,
    title: "Logistique maîtrisée",
    description:
      "Stock européen, livraison 48h garantie, traçabilité bout en bout. Les commandes urgentes sont traitées en priorité.",
  },
];

const STATS = [
  { value: "15+", label: "années d'expérience" },
  { value: "2 500+", label: "professionnels de santé" },
  { value: "48h", label: "livraison garantie" },
  { value: "98%", label: "satisfaction clients" },
];

const MILESTONES = [
  {
    year: "2011",
    title: "Fondation",
    description:
      "Créée par une équipe d'ingénieurs biomédicaux et de praticiens, Althea Systems ouvre son premier entrepôt à Lyon.",
  },
  {
    year: "2015",
    title: "Certification ISO 13485",
    description:
      "Adoption du standard international pour les dispositifs médicaux. Extension du catalogue à l'imagerie et à la chirurgie.",
  },
  {
    year: "2019",
    title: "Expansion européenne",
    description:
      "Ouverture de hubs logistiques en Belgique et en Allemagne. Support multilingue pour les clients de l'Union européenne.",
  },
  {
    year: "2023",
    title: "Plateforme digitale",
    description:
      "Lancement de la nouvelle plateforme e-commerce avec tarifs pro, commandes récurrentes et intégration aux ERP hospitaliers.",
  },
  {
    year: "2026",
    title: "Aujourd'hui",
    description:
      "Plus de 4 000 références distribuées dans toute l'Europe, une équipe de 80 collaborateurs, un engagement RSE renforcé.",
  },
];

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");
  return (
    <div>
      <section className="relative overflow-hidden border-b bg-[#003d5c] text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-primary/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t("hero.eyebrow")}
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              {t.rich("hero.title", {
                em: (chunks) => (
                  <span className="italic text-white/80">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-white text-[#003d5c] hover:bg-white/90"
              >
                <Link href="/products">
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/20">
        <div className="container py-10 md:py-14">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-l-2 border-primary pl-4">
                <div className="text-3xl font-bold tracking-tight md:text-4xl">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Notre histoire
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Une maison de distribution, pas un marketplace.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Althea Systems est née en 2011 d&apos;un constat simple : les
              professionnels de santé perdaient un temps considérable à
              chercher, comparer et qualifier les équipements dont ils
              avaient besoin au quotidien. Nos fondateurs, tous issus du
              milieu biomédical, ont voulu construire un intermédiaire de
              confiance, à taille humaine.
            </p>
            <p>
              Contrairement aux marketplaces généralistes, nous ne référençons
              pas tout ce qui existe. Chaque fabricant passe par un processus
              d&apos;évaluation clinique et logistique. Chaque produit est
              testé par notre comité. Nous assumons des choix — et nous
              tenons à les expliquer.
            </p>
            <p>
              En quinze ans, nous sommes devenus l&apos;un des partenaires de
              référence des cabinets, cliniques et hôpitaux en France et en
              Europe. Toujours à taille humaine, toujours indépendants.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Nos valeurs
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Quatre principes non négociables.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Ce qui guide nos décisions d&apos;achat, notre relation clients
              et notre engagement au quotidien.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              15 ans d&apos;évolution
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Notre parcours.
            </h2>
          </div>

          <ol className="relative mt-14 space-y-10 border-l-2 border-dashed border-border pl-8 md:pl-12">
            {MILESTONES.map((milestone) => (
              <li key={milestone.year} className="relative">
                <div
                  className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-background md:-left-[50px]"
                  aria-hidden="true"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight md:text-xl">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  {milestone.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t bg-[#003d5c] text-white">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
              <Award className="h-3 w-3" aria-hidden="true" />
              Certifications
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
              Des standards européens, pas des promesses.
            </h2>
            <p className="mt-4 text-base text-white/70">
              Tous nos équipements sont conformes aux réglementations CE, IVDR
              et MDR en vigueur. Nous opérons sous certification{" "}
              <strong className="text-white">ISO 13485</strong> et{" "}
              <strong className="text-white">ISO 9001</strong>.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-white text-[#003d5c] hover:bg-white/90"
              >
                <Link href="/contact">
                  <Stethoscope className="mr-2 h-4 w-4" aria-hidden="true" />
                  Nous contacter
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/products">Voir le catalogue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
