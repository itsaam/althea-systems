import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background text-foreground">
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Top rail */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 pt-8 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground"
        >
          Althea Systems
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40">
          ERR · 404 / Product
        </span>
      </header>

      {/* Centered focal block */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              — Erreur 404
            </p>
            <h1 className="mt-6 font-display text-hero leading-[0.9] tracking-[-0.035em] text-foreground">
              Produit
              <br />
              introuvable<span className="text-electric-indigo-500">.</span>
            </h1>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5">
            <p className="max-w-md text-lead text-foreground/70">
              Cette référence n&apos;existe plus, a été retirée du catalogue, ou
              n&apos;a jamais existé. Reprenons le fil.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/categories"
                className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors duration-500 hover:bg-foreground/85"
              >
                Explorer le catalogue
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60 transition-colors duration-300 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom rail */}
      <footer className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 pb-8 sm:px-6 lg:px-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
          Ref · #404-ALT-PROD
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
          Statut · Opérationnel
        </span>
      </footer>
    </div>
  );
}
