import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground grain">
      {/* Ambient gradient orb — brand accent, extreme blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[620px] w-[620px] rounded-full bg-brand-gradient opacity-25 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-24 h-[480px] w-[480px] rounded-full bg-electric-indigo-300 opacity-20 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-2 md:px-10 md:pb-24 md:pt-4 lg:pb-28 lg:pt-6">
        <div className="relative max-w-5xl">
          {/* Eyebrow */}
          <p className="eyebrow flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-10 bg-lavender-mist-500"
            />
            E-commerce médical&nbsp;— Depuis 2011
          </p>

          {/* Massive editorial headline */}
          <h1 className="font-display mt-8 text-display-md text-shadow-grey-900 lg:mt-10 lg:text-display-lg">
            <span className="block">L&apos;équipement</span>
            <span className="block">
              <em className="not-italic font-display italic text-brand-gradient">
                médical
              </em>
              , repensé
            </span>
            <span className="block text-shadow-grey-700">pour les pros.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-shadow-grey-600 md:text-lg lg:mt-10">
            Althea Systems sélectionne, certifie et livre le matériel de pointe
            qui équipe cabinets, cliniques et hôpitaux partout en France. Pas
            de bruit, pas de compromis&nbsp;— juste l&apos;essentiel, bien
            exécuté.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/categories"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-electric-indigo-500 px-8 py-4 text-sm font-medium tracking-wide text-white shadow-[0_12px_40px_-12px_rgba(91,18,237,0.55)] transition-all duration-500 ease-out-expo hover:bg-electric-indigo-600 hover:shadow-[0_18px_50px_-10px_rgba(91,18,237,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-indigo-500"
            >
              Explorer le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-shadow-grey-300 bg-transparent px-8 py-4 text-sm font-medium tracking-wide text-shadow-grey-900 transition-all duration-500 ease-out-expo hover:border-shadow-grey-900 hover:bg-shadow-grey-900 hover:text-white"
            >
              Découvrir Althea
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-current transition-transform duration-500 ease-out-expo group-hover:scale-150"
              />
            </Link>
          </div>

          {/* Meta row — signals */}
          <dl className="mt-14 grid grid-cols-2 gap-x-16 gap-y-6 border-t border-shadow-grey-200 pt-10 sm:grid-cols-3 lg:mt-16 lg:gap-x-24">
            <div>
              <dt className="eyebrow">Catalogue</dt>
              <dd className="font-display mt-2 text-3xl italic text-shadow-grey-900">
                2 500<span className="text-lavender-mist-500">+</span>
              </dd>
              <p className="mt-1 text-xs text-shadow-grey-500">
                références certifiées
              </p>
            </div>
            <div>
              <dt className="eyebrow">Livraison</dt>
              <dd className="font-display mt-2 text-3xl italic text-shadow-grey-900">
                48<span className="text-lavender-mist-500">h</span>
              </dd>
              <p className="mt-1 text-xs text-shadow-grey-500">
                en France métropolitaine
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="eyebrow">Pros équipés</dt>
              <dd className="font-display mt-2 text-3xl italic text-shadow-grey-900">
                2 500<span className="text-lavender-mist-500">+</span>
              </dd>
              <p className="mt-1 text-xs text-shadow-grey-500">
                depuis 2011
              </p>
            </div>
          </dl>
        </div>

        {/* Scroll cue */}
        <div className="hidden lg:absolute lg:bottom-10 lg:right-10 lg:flex lg:items-center lg:gap-3">
          <span className="eyebrow text-shadow-grey-500">Descendre</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-shadow-grey-300 text-shadow-grey-600 animate-[pulse_2.5s_ease-in-out_infinite]">
            <ArrowDown className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}
