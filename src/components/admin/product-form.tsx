"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/admin/image-upload";

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  return (
    <form className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">Nom du produit</Label>
        <Input id="name" placeholder="Nom du produit" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Description du produit"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix</Label>
          <Input id="price" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" placeholder="0" />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Catégorie 1</SelectItem>
            <SelectItem value="2">Catégorie 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ImageUpload />
      <Button type="submit">
        {productId ? "Mettre à jour" : "Créer le produit"}
      </Button>
    </form>
  );
}
