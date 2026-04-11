"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";
import MagneticButton from "@/components/ui/magnetic-button";


const SPECS = [
  { value: "2011", label: "Fondé" },
  { value: "4 800", label: "Praticiens" },
  { value: "48H", label: "Livraison" },
  { value: "ISO 13485", label: "Certifié" },
];

export default function Hero() {
  return (
    <section className="relative isolate grain overflow-hidden bg-background">
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[1400px] flex-col justify-between px-4 pb-20 pt-24 sm:px-6 lg:px-10 lg:pt-32">
        {/* ── Main grid : title left / blueprint right ─────── */}
        <div className="grid grid-cols-1 items-end gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Title */}
          <div className="lg:col-span-7 lg:-translate-x-20 lg:-translate-y-10 xl:-translate-x-32 xl:-translate-y-16">
            <h1 className="font-display text-hero text-foreground">
              <SplitText
                as="span"
                text="L'équipement"
                className="block"
                immediate
              />
              <SplitText
                as="span"
                text="médical,"
                delay={0.2}
                className="block"
                immediate
              />
              <SplitText
                as="span"
                text="repensé."
                delay={0.4}
                className="block text-electric-indigo-500"
                immediate
              />
            </h1>
          </div>

          {/* Blueprint — technical SVG illustration */}
          <ScrollReveal
            delay={0.5}
            className="relative lg:col-span-5 lg:mt-24 xl:mt-32"
          >
            <Blueprint />
          </ScrollReveal>
        </div>

        {/* ── Bottom row : lead + cta + specs ──────────────── */}
        <div className="mt-20 grid grid-cols-1 items-end gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* Specs grid — left side, tabular mono */}
          <ScrollReveal
            delay={0.6}
            className="lg:col-span-6"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border/60 pt-6 sm:grid-cols-4">
              {SPECS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-display text-2xl leading-none tabular-nums text-foreground sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Lead + CTA — right side */}
          <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8">
            <ScrollReveal delay={0.7}>
              <p className="max-w-md text-lead text-foreground/70">
                Althea Systems sélectionne, certifie et livre le matériel de
                pointe qui équipe les pros de santé. Pas de bruit, pas de
                compromis.
              </p>
            </ScrollReveal>

            <ScrollReveal
              delay={0.85}
              className="flex flex-wrap items-center gap-6"
            >
              <MagneticButton
                href="/categories"
                className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors duration-500 hover:bg-electric-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-indigo-500"
              >
                Explorer le catalogue
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </MagneticButton>
              <Link
                href="/contact"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60 underline-offset-4 transition-colors duration-300 hover:text-electric-indigo-500 hover:underline"
              >
                Parler à un conseiller
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Hidden fallback link for no-JS parity */}
      <noscript>
        <Link href="/categories" className="sr-only">
          Explorer le catalogue
        </Link>
      </noscript>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Blueprint — hand-crafted technical SVG
   Concentric rings, crosshair, graduations, dimension lines
   ──────────────────────────────────────────────────────────── */
function Blueprint() {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * 0.08,
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
        opacity: { delay: i * 0.08, duration: 0.4 },
      },
    }),
  };

  return (
    <div className="relative aspect-square w-full max-w-[520px] lg:ml-auto">
      {/* Corner brackets */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-foreground/40" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-foreground/40" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-foreground/40" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-foreground/40" />
      </div>

      {/* Top label */}
      <div className="pointer-events-none absolute left-0 right-0 top-[-28px] flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/40">
        <span>Ref · 001</span>
        <span className="tabular-nums">Ø 340 · mm</span>
      </div>

      {/* SVG Blueprint */}
      <motion.svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="bpgrid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          width="400"
          height="400"
          fill="url(#bpgrid)"
          className="text-foreground"
        />

        {/* Axes */}
        <motion.line
          x1="200"
          y1="20"
          x2="200"
          y2="380"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="0.75"
          strokeDasharray="2 4"
          className="text-foreground"
          variants={draw}
          custom={0}
        />
        <motion.line
          x1="20"
          y1="200"
          x2="380"
          y2="200"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="0.75"
          strokeDasharray="2 4"
          className="text-foreground"
          variants={draw}
          custom={0}
        />

        {/* Outer ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-foreground/60"
          variants={draw}
          custom={1}
        />
        {/* Graduated ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="145"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="1 8"
          className="text-foreground/50"
          variants={draw}
          custom={2}
        />
        {/* Middle ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="110"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-foreground/70"
          variants={draw}
          custom={3}
        />
        {/* Inner ring — indigo accent (focal) */}
        <motion.circle
          cx="200"
          cy="200"
          r="72"
          fill="currentColor"
          fillOpacity="0.06"
          stroke="currentColor"
          strokeWidth="2.25"
          className="text-electric-indigo-500"
          variants={draw}
          custom={4}
        />
        {/* Core dot */}
        <motion.circle
          cx="200"
          cy="200"
          r="5"
          fill="currentColor"
          className="text-electric-indigo-500"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        {/* Focus pointer line */}
        <motion.line
          x1="272"
          y1="200"
          x2="340"
          y2="200"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-electric-indigo-500"
          variants={draw}
          custom={6}
        />
        <motion.text
          x="343"
          y="203"
          className="fill-electric-indigo-500 font-mono"
          fontSize="8"
          letterSpacing="1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          FOCUS · Ø 144
        </motion.text>

        {/* Crosshair radial ticks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 200 + Math.cos(rad) * 170;
          const y1 = 200 + Math.sin(rad) * 170;
          const x2 = 200 + Math.cos(rad) * 182;
          const y2 = 200 + Math.sin(rad) * 182;
          return (
            <motion.line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/60"
              variants={draw}
              custom={5 + i * 0.1}
            />
          );
        })}

        {/* Dimension arrow — top right */}
        <motion.line
          x1="200"
          y1="30"
          x2="370"
          y2="30"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-foreground/40"
          variants={draw}
          custom={7}
        />
        <motion.line
          x1="200"
          y1="25"
          x2="200"
          y2="35"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-foreground/40"
          variants={draw}
          custom={7.2}
        />
        <motion.line
          x1="370"
          y1="25"
          x2="370"
          y2="35"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-foreground/40"
          variants={draw}
          custom={7.4}
        />

        {/* Labels */}
        <motion.text
          x="285"
          y="24"
          textAnchor="middle"
          className="fill-foreground/50 font-mono"
          fontSize="8"
          letterSpacing="1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          R · 170MM
        </motion.text>

        <motion.text
          x="210"
          y="197"
          className="fill-foreground/60 font-mono"
          fontSize="7"
          letterSpacing="1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          0,0
        </motion.text>

        <motion.text
          x="20"
          y="395"
          className="fill-foreground/40 font-mono"
          fontSize="8"
          letterSpacing="1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          ISO 13485 · CE · CLASS IIa
        </motion.text>

        <motion.text
          x="380"
          y="395"
          textAnchor="end"
          className="fill-foreground/40 font-mono"
          fontSize="8"
          letterSpacing="1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.45, duration: 0.5 }}
        >
          TOLERANCE · ±0.05
        </motion.text>
      </motion.svg>

      {/* Bottom label */}
      <div className="pointer-events-none absolute bottom-[-28px] left-0 right-0 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/40">
        <span>Blueprint</span>
        <span className="tabular-nums">Rev · A/24</span>
      </div>
    </div>
  );
}
