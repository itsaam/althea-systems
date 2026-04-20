"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shell/page-header";

const SECTIONS = [
  {
    index: "01",
    title: "Carrousel",
    description:
      "Gérez les slides du carrousel de la page d'accueil. Maximum 3 slides actifs.",
    href: "/admin/homepage/carousel",
  },
  {
    index: "02",
    title: "Produits à la une",
    description:
      "Sélectionnez les produits mis en avant sur la page d'accueil.",
    href: "/admin/homepage/featured-products",
  },
  {
    index: "03",
    title: "Contenu éditorial",
    description:
      "Textes, accroches et blocs marketing personnalisables.",
    href: "/admin/homepage/content",
  },
];

export default function AdminHomepagePage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Admin — Content"
        index="009 / Home"
        title="Page d'accueil"
        description="Configurez le contenu affiché sur la page d'accueil publique de la boutique."
      />

      <div className="grid gap-px bg-border/60 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col justify-between bg-background p-6 transition-colors hover:bg-foreground/[0.02]"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                <span className="mr-1.5 tabular-nums text-foreground/35">
                  {section.index}
                </span>
                Section
              </p>
              <h2 className="mt-4 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">
                {section.description}
              </p>
            </div>
            <p className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 transition-colors group-hover:text-primary">
              Gérer
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
