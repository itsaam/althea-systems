import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center md:py-32 lg:py-40">
        <p className="eyebrow text-shadow-grey-500">
          E-commerce médical · Depuis 2011
        </p>

        <h1 className="font-display mt-10 text-display-lg leading-[0.95] tracking-tight text-shadow-grey-900 md:text-[7rem] lg:text-[9rem]">
          <span className="block">L&apos;équipement médical,</span>
          <span className="block">
            <em className="italic text-brand-gradient">repensé</em>.
          </span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-shadow-grey-600 md:text-xl">
          Althea Systems sélectionne, certifie et livre le matériel de pointe
          qui équipe les pros de santé. Pas de bruit, pas de compromis.
        </p>

        <Link
          href="/categories"
          className="group mt-12 inline-flex items-center gap-3 rounded-full bg-electric-indigo-500 px-10 py-5 text-sm font-medium tracking-wide text-white shadow-[0_12px_40px_-12px_rgba(91,18,237,0.55)] transition-all duration-500 ease-out-expo hover:bg-electric-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-indigo-500"
        >
          Explorer le catalogue
          <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
