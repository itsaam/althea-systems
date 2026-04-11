import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark relative min-h-screen bg-[#1a1a1a] text-foreground">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-10">
        {/* ── Top rail ──────────────────────────────────────── */}
        <header className="flex items-center justify-between pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55">
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
            aria-label="Retour à l'accueil"
          >
            Althea Systems
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            <span>Retour</span>
          </Link>
        </header>

        {/* ── Centered focal block ──────────────────────────── */}
        <main className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        {/* ── Bottom rail ───────────────────────────────────── */}
        <footer className="pb-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
          © {new Date().getFullYear()} Althea Systems
        </footer>
      </div>
    </div>
  );
}
