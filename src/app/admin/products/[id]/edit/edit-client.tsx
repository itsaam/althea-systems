"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/shell/page-header";
import ProductForm from "@/components/admin/product-form";

interface EditProductPageClientProps {
  productId: string;
}

export default function EditProductPageClient({
  productId,
}: EditProductPageClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Admin — Catalogue · FR"
        index="Index · 002 / Product Edit"
        title="Éditer le produit."
        description="Modifiez les informations du produit, ses visuels, ses tarifs et son statut de publication."
        actions={
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="h-9 rounded-none px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground"
          >
            Retour catalogue
          </button>
        }
      />
      <ProductForm productId={productId} />
    </div>
  );
}
