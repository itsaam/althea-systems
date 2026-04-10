import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CtaFinal() {
  return (
    <section className="relative isolate overflow-hidden bg-background py-24 md:py-36">
      {/* Ambient blur orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-20 blur-[180px]"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center md:px-10">
        <p className="eyebrow">Prêt à passer commande ?</p>

        <h2 className="font-display mt-8 text-display-md text-shadow-grey-900 md:mt-10">
          Équipez votre cabinet
          <br />
          <em className="not-italic italic text-brand-gradient">
            comme il le mérite.
          </em>
        </h2>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-shadow-grey-600 md:text-lg">
          Catalogue complet, livraison 48h, un interlocuteur humain au bout du
          fil. On s&apos;occupe du matériel&nbsp;— vous, vous soignez.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/categories"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-electric-indigo-500 px-10 py-5 text-base font-medium text-white shadow-[0_18px_50px_-12px_rgba(91,18,237,0.6)] transition-all duration-500 ease-out-expo hover:bg-electric-indigo-600 hover:shadow-[0_24px_70px_-12px_rgba(91,18,237,0.75)]"
          >
            Parcourir le catalogue
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 text-base font-medium text-shadow-grey-900 transition-colors duration-500 hover:text-electric-indigo-600"
          >
            Parler à un conseiller
            <span
              aria-hidden="true"
              className="block h-px w-8 bg-current transition-all duration-500 ease-out-expo group-hover:w-12"
            />
          </Link>
        </div>

        {/* Signature footer line */}
        <div className="mt-20 flex items-center gap-4 text-xs text-shadow-grey-500">
          <span className="h-px w-12 bg-shadow-grey-300" />
          <span className="font-mono uppercase tracking-[0.18em]">
            Althea Systems — Éd. Printemps 2026
          </span>
          <span className="h-px w-12 bg-shadow-grey-300" />
        </div>
      </div>
    </section>
  );
}
