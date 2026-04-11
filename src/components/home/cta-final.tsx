import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CtaFinal() {
  return (
    <section className="bg-shadow-grey-950 py-32 text-white md:py-48">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="eyebrow text-lavender-mist-300">Prêt à équiper</p>

        <h2 className="font-display mt-8 text-display-md italic text-white md:text-display-lg">
          Équipons votre <em className="text-brand-gradient">cabinet</em>.
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-shadow-grey-300">
          Parlez-nous de votre projet. Un conseiller Althea vous rappelle sous
          24h pour dimensionner votre équipement.
        </p>

        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-medium tracking-wide text-shadow-grey-950 shadow-xl transition-all duration-500 ease-out-expo hover:bg-shadow-grey-100"
          >
            Nous contacter
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-10 py-5 text-sm font-medium tracking-wide text-white transition-all duration-500 ease-out-expo hover:bg-white/5"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
