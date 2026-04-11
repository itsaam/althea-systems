import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";
import MagneticButton from "@/components/ui/magnetic-button";

export default function CtaFinal() {
  return (
    <section className="relative isolate grain flex min-h-[100svh] flex-col justify-between overflow-hidden bg-shadow-grey-950 py-28 text-white md:py-36">
      {/* Horizon line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10"
      />

      {/* Giant outline wordmark — full-bleed editorial backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-6vw] z-0 flex justify-center overflow-hidden leading-none"
      >
        <span
          className="select-none whitespace-nowrap font-display text-[28vw] font-semibold leading-[0.8] tracking-[-0.04em]"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            color: "transparent",
          }}
        >
          ALTHEA
        </span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-10">
        {/* ── Top eyebrow row ──────────────────────────────── */}
        <ScrollReveal>
          <div className="flex flex-col gap-6 text-[10px] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono uppercase tracking-[0.22em] text-white/50">
              Althea Systems <span className="mx-2 text-white/20">—</span>{" "}
              Contact · FR
            </span>
            <span className="font-mono uppercase tracking-[0.22em] tabular-nums text-white/35">
              Index · END
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Centered focal block : title + lead + CTA ──────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 lg:px-10">
        <h2 className="font-display text-hero text-white">
          <SplitText as="span" text="Travaillons" className="block" />
          <SplitText
            as="span"
            text="ensemble."
            delay={0.2}
            className="block text-electric-indigo-400"
          />
        </h2>

        <ScrollReveal delay={0.4}>
          <p className="mx-auto mt-10 max-w-md text-lead text-white/75">
            Une réponse humaine sous 24h. Pas un formulaire.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.55} className="mt-12">
          <MagneticButton
            href="/contact"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-12 py-6 font-mono text-[12px] uppercase tracking-[0.18em] text-shadow-grey-950 transition-colors duration-500 hover:bg-electric-indigo-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-indigo-400"
          >
            Démarrer
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </MagneticButton>
        </ScrollReveal>
      </div>

      {/* ── Bottom footer line — human signal ──────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <ScrollReveal delay={0.7}>
          <div className="flex items-center justify-center border-t border-white/10 pt-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              Lun–Ven <span className="mx-2 text-white/20">·</span> 09h–19h{" "}
              <span className="mx-2 text-white/20">·</span> Paris
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
