"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/shell/page-header";
import CategoryForm from "@/components/admin/category-form";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Admin — Catalogue · FR"
        index="Index · 006 / Category New"
        title="Nouvelle catégorie."
        description="Créez une nouvelle catégorie pour structurer votre taxonomie de catalogue."
        actions={
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="h-9 rounded-none px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground"
          >
            Retour catégories
          </button>
        }
      />
      <CategoryForm />
    </div>
  );
}
