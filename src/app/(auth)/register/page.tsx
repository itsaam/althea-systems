import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription — Althea Systems",
  description:
    "Créez votre compte Althea Systems et accédez au catalogue professionnel d'équipements médicaux.",
};

export default function RegisterPage() {
  return (
    <div>
      {/* ── Title ──────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          — Inscription
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Créer un compte.
        </h1>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <RegisterForm />

      {/* ── Switch to login ────────────────────────────────── */}
      <div className="mt-10 text-center">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground"
        >
          <span>Déjà un compte ?</span>
          <span className="text-foreground underline-offset-4 group-hover:underline">
            Connectez-vous
          </span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
