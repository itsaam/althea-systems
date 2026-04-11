import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion — Althea Systems",
  description:
    "Connectez-vous à votre compte Althea Systems pour accéder à vos commandes, factures et conseillers dédiés.",
};

export default function LoginPage() {
  return (
    <div>
      {/* ── Title ──────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          — Connexion
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Bon retour.
        </h1>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <LoginForm />

      {/* ── Switch to register ─────────────────────────────── */}
      <div className="mt-10 text-center">
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground"
        >
          <span>Pas encore de compte ?</span>
          <span className="text-foreground underline-offset-4 group-hover:underline">
            Inscrivez-vous
          </span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
