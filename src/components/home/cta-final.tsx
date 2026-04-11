import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";
import MagneticButton from "@/components/ui/magnetic-button";

export default function CtaFinal() {
  return (
    <section className="relative overflow-hidden bg-electric-indigo-900 py-32 text-white md:py-56 lg:py-72">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-20 h-[600px] w-[600px] rounded-full bg-electric-indigo-500 opacity-40 blur-[180px]" />
        <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-lavender-mist-400 opacity-25 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <ScrollReveal>
          <p className="eyebrow text-lavender-mist-300">Prêt à équiper</p>
        </ScrollReveal>

        <h2 className="font-display mt-8 text-display-md leading-[0.92] text-white md:text-display-lg">
          <SplitText
            as="span"
            text="Équipons votre"
            className="block not-italic"
          />
          <SplitText
            as="span"
            text="cabinet."
            delay={0.35}
            className="block italic text-brand-gradient"
          />
        </h2>

        <ScrollReveal delay={0.7}>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-white/80">
            Parlez-nous de votre projet. Un conseiller Althea vous rappelle
            sous 24h pour dimensionner votre équipement.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.9}>
          <div className="mt-14 flex flex-col justify-center gap-4 sm:flex-row">
            <MagneticButton
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-medium tracking-wide text-shadow-grey-900 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)] transition-colors duration-500 hover:bg-shadow-grey-100"
            >
              Nous contacter
              <ArrowUpRight className="h-5 w-5" />
            </MagneticButton>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-10 py-5 text-sm font-medium tracking-wide text-white transition-colors duration-500 hover:bg-white/10"
            >
              Voir le catalogue
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
