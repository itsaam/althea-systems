import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "@/components/search/search-client";

export const metadata: Metadata = {
  title: "Recherche",
  description:
    "Explorez le catalogue Althea Systems avec des filtres avancés : catégories, prix, disponibilité et tri.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  );
}
