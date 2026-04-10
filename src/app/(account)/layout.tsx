import type { Metadata } from "next";
import AccountSidebar from "@/components/layout/account-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Mon compte",
    template: "%s · Mon compte Althea Systems",
  },
  description:
    "Gérez votre profil, vos adresses, vos moyens de paiement et vos commandes sur Althea Systems.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Espace client
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Mon compte
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pilotez votre profil, vos adresses, vos moyens de paiement et vos
          commandes. Toutes vos informations sont chiffrées et sécurisées.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <AccountSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
