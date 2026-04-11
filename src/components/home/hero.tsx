import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";
import MagneticButton from "@/components/ui/magnetic-button";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-shadow-grey-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="hero-blob hero-blob-1 absolute -top-40 -left-20 h-[600px] w-[600px] rounded-full bg-electric-indigo-200 opacity-60 blur-[140px]" />
        <div className="hero-blob hero-blob-2 absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-lavender-mist-300 opacity-50 blur-[160px]" />
        <div className="hero-blob hero-blob-3 absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-electric-indigo-100 opacity-40 blur-[180px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6 py-32 text-center md:py-48 lg:py-56">
        <ScrollReveal>
          <p className="eyebrow text-shadow-grey-500">
            E-commerce médical · Depuis 2011
          </p>
        </ScrollReveal>

        <h1 className="font-display mt-10 text-[4rem] leading-[0.92] tracking-tight text-shadow-grey-900 md:text-[7rem] lg:text-[9rem]">
          <SplitText
            as="span"
            text="L'équipement médical,"
            className="block not-italic"
          />
          <SplitText
            as="span"
            text="repensé."
            delay={0.45}
            className="block italic text-brand-gradient"
          />
        </h1>

        <ScrollReveal delay={0.9}>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-shadow-grey-600 md:text-xl">
            Althea Systems sélectionne, certifie et livre le matériel de pointe
            qui équipe les pros de santé. Pas de bruit, pas de compromis.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1.1}>
          <div className="mt-14">
            <MagneticButton
              href="/categories"
              className="group inline-flex items-center gap-3 rounded-full bg-electric-indigo-600 px-10 py-5 text-sm font-medium tracking-wide text-white shadow-[0_20px_60px_-15px_rgba(91,18,237,0.55)] transition-colors duration-500 hover:bg-electric-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-indigo-500"
            >
              Explorer le catalogue
              <ArrowUpRight className="h-5 w-5" />
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes heroDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.05); }
        }
        @keyframes heroDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.08); }
        }
        @keyframes heroDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 20px) scale(0.95); }
        }
        .hero-blob-1 { animation: heroDrift1 18s ease-in-out infinite alternate; }
        .hero-blob-2 { animation: heroDrift2 22s ease-in-out infinite alternate; animation-delay: -4s; }
        .hero-blob-3 { animation: heroDrift3 25s ease-in-out infinite alternate; animation-delay: -8s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-blob { animation: none !important; }
        }
      `}</style>

      {/* Hidden fallback link for no-JS parity */}
      <noscript>
        <Link href="/categories" className="sr-only">
          Explorer le catalogue
        </Link>
      </noscript>
    </section>
  );
}
