import type { Metadata } from "next";
import AddressList from "@/components/account/address-list";

export const metadata: Metadata = {
  title: "Mes adresses",
  description:
    "Gérez votre carnet d'adresses de livraison et de facturation sur Althea Systems.",
};

export default function AddressesPage() {
  return <AddressList />;
}
