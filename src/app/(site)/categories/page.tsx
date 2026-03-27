import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories - Equipements medicaux",
  description:
    "Parcourez nos categories d'equipements medicaux professionnels. Materiel de diagnostic, chirurgie, soins et plus.",
  alternates: {
    canonical: "/categories",
  },
};

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Catégories</h1>
      {/* Categories list */}
    </div>
  );
}
