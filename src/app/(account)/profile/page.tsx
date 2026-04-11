import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AccountPageHeader from "@/components/account/account-page-header";
import ProfileForm from "@/components/account/profile-form";
import PasswordForm from "@/components/account/password-form";

export const metadata: Metadata = {
  title: "Mon profil",
  description:
    "Modifiez vos informations personnelles, votre mot de passe et vos préférences de compte Althea Systems.",
};

const QUICK_LINKS = [
  { href: "/orders", label: "Commandes", index: "01" },
  { href: "/addresses", label: "Adresses", index: "02" },
  { href: "/payments", label: "Paiement", index: "03" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <AccountPageHeader
        eyebrow="Profil"
        index="Index · 001 / Profile"
        title="Mon profil."
        description="Gérez vos informations personnelles et la sécurité de votre compte."
      />

      {/* ── Bento grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        {/* Profile form — large main card */}
        <div className="border border-border/60 bg-background p-8 lg:col-span-8 lg:row-span-2 lg:p-10">
          <ProfileForm />
        </div>

        {/* Identity card — top right */}
        <div className="border border-border/60 bg-background p-8 lg:col-span-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Identité
          </p>
          <p className="mt-5 font-display text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            Espace
            <br />
            personnel<span className="text-electric-indigo-500">.</span>
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/60">
            Vos données sont chiffrées et hébergées en UE.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            <span>ISO 13485</span>
            <span className="text-foreground/20">·</span>
            <span>TLS 1.3</span>
            <span className="text-foreground/20">·</span>
            <span>RGPD</span>
          </div>
        </div>

        {/* Quick links card — bottom right */}
        <div className="border border-border/60 bg-background p-8 lg:col-span-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
            <span className="mr-1.5 opacity-60">—</span>
            Accès rapide
          </p>
          <ul className="mt-5 divide-y divide-border/60">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between py-3 font-mono text-[14px] lowercase tracking-[0.06em] text-foreground/70 transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40">
                      {link.index}
                    </span>
                    <span>{link.label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-foreground/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Security card — full width below */}
        <div className="border border-border/60 bg-background p-8 lg:col-span-12 lg:p-10">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
