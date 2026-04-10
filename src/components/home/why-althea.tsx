import { Microscope, Truck, ShieldCheck, Headphones } from "lucide-react";

const PILLARS = [
  {
    icon: Microscope,
    eyebrow: "01 — Curation",
    title: "Une sélection, pas un catalogue",
    body:
      "Chaque référence est choisie par des praticiens. On refuse 80% du marché pour ne garder que l'équipement qui tient la route en conditions réelles.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "02 — Conformité",
    title: "Normes et traçabilité, sans zone grise",
    body:
      "ISO 13485, marquage CE, fiches techniques vérifiables, traçabilité par lot. Vos audits ne trouveront rien à redire — c'est la moindre des choses.",
  },
  {
    icon: Truck,
    eyebrow: "03 — Logistique",
    title: "48h chrono, sans drame",
    body:
      "Stock français, expéditions quotidiennes, tracking dès la validation. On livre vite parce que votre planning n'attend pas le nôtre.",
  },
  {
    icon: Headphones,
    eyebrow: "04 — Relation",
    title: "Un interlocuteur qui connaît le métier",
    body:
      "Pas de hotline générique. Vous appelez, vous tombez sur quelqu'un qui a tenu un cabinet, testé l'appareil, lu la notice. C'est rare, c'est normal chez nous.",
  },
];

export default function WhyAlthea() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header — editorial */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">Pourquoi Althea</p>
            <h2 className="font-display mt-6 text-display-sm text-shadow-grey-900">
              Quatre convictions,
              <br />
              <em className="not-italic italic text-brand-gradient">
                zéro compromis.
              </em>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="text-base leading-relaxed text-shadow-grey-700 md:text-lg">
              Équiper un cabinet médical, ce n&apos;est pas remplir un panier.
              C&apos;est choisir des outils qui soignent, en toute confiance.
              Voilà ce qu&apos;on fait, et comment on le fait.
            </p>
          </div>
        </div>

        {/* Asymmetric pillars grid */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl bg-shadow-grey-200 md:mt-28 md:grid-cols-2">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            const isOffset = index % 2 === 1;
            return (
              <article
                key={pillar.eyebrow}
                className={`group relative flex flex-col gap-6 bg-background p-8 transition-colors duration-500 hover:bg-shadow-grey-50 md:p-12 ${
                  isOffset ? "md:pt-16" : "md:pb-16"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-shadow-grey-200 bg-background text-electric-indigo-500 transition-all duration-500 ease-out-expo group-hover:-rotate-6 group-hover:border-electric-indigo-200 group-hover:bg-electric-indigo-50">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="eyebrow text-shadow-grey-400 transition-colors duration-500 group-hover:text-lavender-mist-600">
                    {pillar.eyebrow}
                  </span>
                </div>

                <h3 className="font-display text-3xl italic leading-tight text-shadow-grey-900 md:text-4xl">
                  {pillar.title}
                </h3>

                <p className="max-w-md text-base leading-relaxed text-shadow-grey-600">
                  {pillar.body}
                </p>

                {/* Hover underline */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-8 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-electric-indigo-500 via-lavender-mist-500 to-transparent transition-transform duration-700 ease-out-expo group-hover:scale-x-100 md:inset-x-12"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
