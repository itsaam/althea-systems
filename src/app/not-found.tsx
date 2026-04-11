import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Giant 404 outline wordmark — full-bleed editorial backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden leading-none"
      >
        <span
          className="select-none whitespace-nowrap font-display text-[60vw] font-semibold leading-[0.8] tracking-[-0.06em] md:text-[45vw]"
          style={{
            WebkitTextStroke: "1px rgba(0,0,0,0.06)",
            color: "transparent",
          }}
        >
          404
        </span>
      </div>

      {/* Top rail */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 pt-8 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/65 transition-colors hover:text-foreground"
        >
          <span className="text-foreground">Althea Systems</span>
          <span className="mx-2 text-foreground/30">—</span>
          <span>Medical Equipment</span>
        </Link>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] tabular-nums text-foreground/45">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-electric-indigo-500"
          />
          ERR · Route introuvable
        </span>
      </header>

      {/* Centered focal block */}
      <section className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-4 py-20 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-2 opacity-60">—</span>
            Erreur 404 · Page introuvable
          </p>

          <h1 className="mt-10 font-display text-[56px] font-semibold leading-[0.95] tracking-[-0.035em] text-foreground sm:text-[88px] lg:text-[120px]">
            Cette page
            <br />
            n&apos;existe pas
            <span className="text-electric-indigo-500">.</span>
          </h1>

          <p className="mt-10 max-w-xl text-[18px] leading-relaxed text-foreground/65 sm:text-[20px]">
            Elle a été déplacée, retirée du catalogue, ou n&apos;a jamais
            existé. Reprenons le fil — rien n&apos;est perdu.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-foreground px-10 py-5 font-mono text-[12px] uppercase tracking-[0.2em] text-background transition-colors duration-500 hover:bg-foreground/85"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-x-0.5" />
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/categories"
              className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-foreground/60 transition-colors duration-300 hover:text-foreground"
            >
              Explorer le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom rail */}
      <footer className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-4 border-t border-border/60 px-4 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <span>Ref · #404-ALT-ROUTE</span>
        <span className="hidden sm:inline">ISO 13485 · CE · Class IIa</span>
        <span>Statut · Opérationnel</span>
      </footer>
    </main>
  );
}
