"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface Section {
  id: string;
  label: string;
  eyebrow: string;
  content: React.ReactNode;
}

interface ProductDetailsTabsProps {
  description: string | null;
  sku?: string | null;
  categoryName?: string | null;
  stock: number;
}

export default function ProductDetailsTabs({
  description,
  sku,
  categoryName,
  stock,
}: ProductDetailsTabsProps) {
  const [openId, setOpenId] = useState<string | null>("description");

  const sections: Section[] = [
    {
      id: "description",
      eyebrow: "01",
      label: "Description complète",
      content: description ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-shadow-grey-700 md:text-lg">
          {description}
        </p>
      ) : (
        <p className="text-base italic text-shadow-grey-500">
          Fiche produit en cours de rédaction — contactez-nous pour obtenir la
          documentation détaillée.
        </p>
      ),
    },
    {
      id: "specs",
      eyebrow: "02",
      label: "Caractéristiques techniques",
      content: (
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-shadow-grey-200 bg-shadow-grey-200 sm:grid-cols-2">
          {[
            { dt: "Référence", dd: sku || "—" },
            { dt: "Catégorie", dd: categoryName || "—" },
            {
              dt: "Disponibilité",
              dd: stock > 0 ? `${stock} en stock` : "Sur commande",
            },
            { dt: "Conformité", dd: "ISO 13485 · CE" },
            { dt: "Traçabilité", dd: "Numéro de lot fourni" },
            { dt: "Garantie", dd: "24 mois constructeur" },
          ].map((row) => (
            <div
              key={row.dt}
              className="flex items-baseline justify-between gap-4 bg-background px-6 py-5"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-shadow-grey-500">
                {row.dt}
              </dt>
              <dd className="text-right text-sm font-medium text-shadow-grey-900">
                {row.dd}
              </dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      id: "reviews",
      eyebrow: "03",
      label: "Avis de professionnels",
      content: (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-shadow-grey-300 bg-shadow-grey-50 p-8">
          <p className="eyebrow text-shadow-grey-500">Bientôt disponible</p>
          <p className="font-display text-2xl italic text-shadow-grey-900">
            Les premiers retours arrivent au printemps 2026.
          </p>
          <p className="text-sm leading-relaxed text-shadow-grey-600">
            Nous modérons chaque avis à la main pour garantir leur pertinence.
            Équipez-vous aujourd&apos;hui et laissez votre témoignage dès
            réception.
          </p>
        </div>
      ),
    },
    {
      id: "faq",
      eyebrow: "04",
      label: "Questions fréquentes",
      content: (
        <div className="divide-y divide-shadow-grey-200">
          {[
            {
              q: "Quels sont les délais de livraison ?",
              a: "48 heures ouvrées en France métropolitaine après validation de la commande. Un numéro de suivi vous est envoyé dès l'expédition.",
            },
            {
              q: "Puis-je retourner un produit ?",
              a: "Oui, vous disposez de 30 jours pour nous retourner le produit dans son emballage d'origine. Aucun frais de restockage.",
            },
            {
              q: "Facture et TVA ?",
              a: "Une facture conforme est générée automatiquement avec le numéro de TVA intracommunautaire si fourni lors de la commande.",
            },
            {
              q: "Quelle garantie sur l'équipement ?",
              a: "24 mois constructeur minimum. Le SAV Althea prend le relais en cas de litige avec le fabricant.",
            },
          ].map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="text-base font-medium text-shadow-grey-900 md:text-lg">
                  {item.q}
                </span>
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-shadow-grey-300 text-shadow-grey-600 transition-colors duration-300 group-open:border-electric-indigo-500 group-open:bg-electric-indigo-500 group-open:text-white">
                  <Plus className="h-3 w-3 group-open:hidden" />
                  <Minus className="hidden h-3 w-3 group-open:block" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-shadow-grey-600 md:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="mt-20 md:mt-28">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        {/* Sticky index (desktop) */}
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <p className="eyebrow">Fiche produit</p>
            <h2 className="font-display mt-5 text-3xl italic leading-tight text-shadow-grey-900 md:text-4xl">
              Tout savoir
              <br />
              <em className="not-italic italic text-brand-gradient">
                sur ce produit.
              </em>
            </h2>

            <nav aria-label="Navigation fiche produit" className="mt-8 hidden md:block">
              <ul className="flex flex-col gap-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(section.id)}
                      className={`group flex w-full items-baseline gap-3 text-left text-sm transition-colors duration-300 ${
                        openId === section.id
                          ? "text-electric-indigo-600"
                          : "text-shadow-grey-500 hover:text-shadow-grey-900"
                      }`}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        {section.eyebrow}
                      </span>
                      <span className="font-medium">{section.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Sections */}
        <div className="md:col-span-9">
          <div className="flex flex-col divide-y divide-shadow-grey-200">
            {sections.map((section) => {
              const isOpen = openId === section.id;
              return (
                <div key={section.id} className="py-8 first:pt-0">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId(isOpen ? null : section.id)
                    }
                    aria-expanded={isOpen}
                    className="group flex w-full items-baseline justify-between gap-6 text-left"
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-shadow-grey-400">
                        {section.eyebrow}
                      </span>
                      <h3 className="font-display text-2xl italic leading-tight text-shadow-grey-900 md:text-3xl">
                        {section.label}
                      </h3>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-shadow-grey-300 text-shadow-grey-600 transition-all duration-500 ease-out-expo group-hover:border-shadow-grey-900 group-hover:text-shadow-grey-900">
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-700 ease-out-expo ${
                      isOpen
                        ? "mt-8 grid-rows-[1fr] opacity-100"
                        : "mt-0 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">{section.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
