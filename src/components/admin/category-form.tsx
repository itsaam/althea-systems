"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/admin/image-upload";

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  return (
    <form className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">Nom de la catégorie</Label>
        <Input id="name" placeholder="Nom de la catégorie" />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="nom-de-la-categorie" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Description de la catégorie"
        />
      </div>
      <ImageUpload />
      <Button type="submit">
        {categoryId ? "Mettre à jour" : "Créer la catégorie"}
      </Button>
    </form>
  );
}
