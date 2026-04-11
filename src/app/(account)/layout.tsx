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
    <div className="flex min-h-screen bg-background">
      <AccountSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[900px] px-6 py-12 md:px-10 md:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
