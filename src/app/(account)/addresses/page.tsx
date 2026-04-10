import type { Metadata } from "next";
import AddressList from "@/components/account/address-list";

export const metadata: Metadata = {
  title: "Mes adresses",
  description:
    "Gérez votre carnet d'adresses de livraison et de facturation sur Althea Systems.",
};

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Carnet d&apos;adresses
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajoutez, modifiez et définissez vos adresses de livraison et de
          facturation par défaut.
        </p>
      </div>
      <AddressList />
    </div>
  );
}
