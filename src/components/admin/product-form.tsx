"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DOMPurify from "dompurify";

import { productFormSchema, type ProductFormData } from "@/lib/validators/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";
import { useDebounce } from "@/hooks/use-debounce";
import { Eye } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  productId?: string;
}

interface Category {
  id: string;
  name: string;
}

const TVA_LABELS: Record<string, string> = {
  TVA_20: "20%",
  TVA_10: "10%",
  TVA_5_5: "5.5%",
  TVA_0: "0%",
};

const TVA_RATES: Record<string, number> = {
  TVA_20: 1.20,
  TVA_10: 1.10,
  TVA_5_5: 1.055,
  TVA_0: 1.00,
};

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      technicalSpecs: null,
      price: 0,
      comparePrice: null,
      tva: "TVA_20",
      sku: null,
      stock: 0,
      priority: 0,
      images: [],
      featured: false,
      status: "DRAFT",
      categoryId: null,
    },
  });

  const watchedValues = watch();
  const watchName = watch("name");
  const debouncedName = useDebounce(watchName, 300);
  const watchDescription = watch("description");
  const watchImages = watch("images");
  const watchPrice = watch("price");
  const watchTva = watch("tva");
  const watchPriority = watch("priority");

  // Charger les catégories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(() => {
        toast.error("Impossible de charger les catégories");
      });
  }, []);

  // Charger le produit en mode édition
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      fetch(`/api/admin/products/${productId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Produit non trouvé");
          return res.json();
        })
        .then((data) => {
          const product = data.product;
          reset({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            technicalSpecs: product.technicalSpecs || "",
            price: product.price || 0,
            comparePrice: product.comparePrice || null,
            tva: product.tva || "TVA_20",
            sku: product.sku || "",
            stock: product.stock || 0,
            priority: product.priority || 0,
            images: product.images || [],
            featured: product.featured || false,
            status: product.status || "DRAFT",
            categoryId: product.categoryId || null,
          });
        })
        .catch(() => {
          toast.error("Impossible de charger le produit");
          router.push("/admin/products");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, router, reset]);

  // Génération automatique du slug
  useEffect(() => {
    if (!productId && debouncedName) {
      const slug = debouncedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, '-');
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [debouncedName, productId, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      const url = productId ? `/api/admin/products/${productId}` : `/api/admin/products`;
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(productId ? "Produit mis à jour avec succès" : "Produit créé avec succès");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePriceTTC = (priceHT: number, tva: string): number => {
    return priceHT * TVA_RATES[tva];
  };

  if (productId && isLoading && !watchedValues.name) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        {/* Section Informations générales */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Informations générales</h2>

          {/* Nom */}
          <div>
            <Label htmlFor="name">
              Nom du produit <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Stéthoscope électronique 3M Littmann"
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">
              Slug SEO <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="Ex: stethoscope-electronique-3m-littmann"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              URL du produit : /products/{watchedValues.slug || "..."}
            </p>
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          </div>

          {/* SKU */}
          <div>
            <Label htmlFor="sku">SKU (optionnel)</Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="Ex: STH-3M-001"
              disabled={isLoading}
            />
            {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <Label htmlFor="categoryId">Catégorie</Label>
            <Select
              value={watchedValues.categoryId || undefined}
              onValueChange={(value) => setValue("categoryId", value || null, { shouldValidate: true, shouldDirty: true })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Section Description */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Description</h2>

          <div>
            <RichTextEditor
              value={watchDescription || ""}
              onChange={(html) => setValue("description", html, { shouldValidate: true, shouldDirty: true })}
              placeholder="Décrivez les avantages et caractéristiques du produit..."
              disabled={isLoading}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Textarea
              id="technicalSpecs"
              {...register("technicalSpecs")}
              placeholder="Ex: Dimensions, poids, matériaux, certifications..."
              rows={5}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Spécifications techniques du produit
            </p>
            {errors.technicalSpecs && <p className="text-sm text-destructive mt-1">{errors.technicalSpecs.message}</p>}
          </div>
        </div>

        {/* Section Images */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Images</h2>

          <div>
            <MultiImageUpload
              value={watchImages}
              onChange={(urls) => setValue("images", urls, { shouldValidate: true, shouldDirty: true })}
              disabled={isLoading}
            />
            {errors.images && <p className="text-sm text-destructive mt-1">{errors.images.message}</p>}
          </div>
        </div>

        {/* Section Prix et Stock */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Prix et stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prix HT */}
            <div>
              <Label htmlFor="price">
                Prix HT (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                placeholder="Ex: 99.99"
                disabled={isLoading}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

            {/* Prix comparaison */}
            <div>
              <Label htmlFor="comparePrice">Prix de comparaison HT (€)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                {...register("comparePrice", { 
                  setValueAs: (v) => (v === "" || v === null ? null : parseFloat(v)),
                })}
                placeholder="Ex: 129.99"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Prix barré (si promotion)
              </p>
              {errors.comparePrice && <p className="text-sm text-destructive mt-1">{errors.comparePrice.message}</p>}
            </div>

            {/* TVA */}
            <div>
              <Label htmlFor="tva">
                Taux de TVA <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchTva}
                onValueChange={(value) => setValue("tva", value as "TVA_20" | "TVA_10" | "TVA_5_5" | "TVA_0", { shouldValidate: true, shouldDirty: true })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un taux" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TVA_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Prix TTC : {calculatePriceTTC(watchPrice || 0, watchTva).toFixed(2)} €
              </p>
              {errors.tva && <p className="text-sm text-destructive mt-1">{errors.tva.message}</p>}
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">
                Stock <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", { valueAsNumber: true })}
                placeholder="Ex: 50"
                disabled={isLoading}
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>
        </div>

        {/* Section Paramètres */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Paramètres</h2>

          {/* Priorité */}
          <div>
            <Label htmlFor="priority">
              Priorité d&apos;affichage : {watchPriority}
            </Label>
            <div className="pt-2">
              <Slider
                id="priority"
                value={[watchPriority]}
                onValueChange={([value]) => setValue("priority", value, { shouldValidate: true, shouldDirty: true })}
                min={0}
                max={100}
                step={1}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Plus la priorité est élevée, plus le produit sera mis en avant (0 = normal, 100 = maximum)
            </p>
            {errors.priority && <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>}
          </div>

          {/* Produit mis en avant */}
          <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
            <div className="space-y-0.5">
              <Label htmlFor="featured">Produit mis en avant</Label>
              <p className="text-sm text-muted-foreground">
                Afficher ce produit dans les sélections spéciales
              </p>
            </div>
            <Switch
              id="featured"
              checked={watchedValues.featured}
              onCheckedChange={(checked) => setValue("featured", checked, { shouldValidate: true, shouldDirty: true })}
              disabled={isLoading}
            />
          </div>

          {/* Statut */}
          <div>
            <Label htmlFor="status">
              Statut de publication <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.status}
              onValueChange={(value) => setValue("status", value as "DRAFT" | "PUBLISHED", { shouldValidate: true, shouldDirty: true })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Seuls les produits publiés sont visibles sur le site
            </p>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={isLoading || !watchedValues.name}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>

          <div className="flex-1" />

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isLoading}
          >
            Annuler
          </Button>

          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading
              ? "Enregistrement..."
              : productId
              ? "Mettre à jour"
              : watchedValues.status === "PUBLISHED"
              ? "Publier"
              : "Enregistrer en brouillon"}
          </Button>
        </div>
      </form>

      {/* Modal de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation du produit</DialogTitle>
            <DialogDescription>
              Aperçu de l&apos;affichage du produit sur le site
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Images */}
            {watchImages.length > 0 ? (
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={watchImages[0]}
                  alt={watchedValues.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Aucune image</p>
              </div>
            )}

            {/* Informations */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{watchedValues.name || "Nom du produit"}</h3>
                {watchedValues.sku && (
                  <p className="text-sm text-muted-foreground">SKU: {watchedValues.sku}</p>
                )}
              </div>

              {/* Prix */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {calculatePriceTTC(watchPrice || 0, watchTva).toFixed(2)} € TTC
                </span>
                {watchedValues.comparePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {calculatePriceTTC(watchedValues.comparePrice, watchTva).toFixed(2)} €
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Prix HT : {(watchPrice || 0).toFixed(2)} € | TVA : {TVA_LABELS[watchTva]}
              </div>

              {/* Stock */}
              <div>
                {watchedValues.stock > 0 ? (
                  <span className="text-sm text-green-600">En stock ({watchedValues.stock} disponible{watchedValues.stock > 1 ? "s" : ""})</span>
                ) : (
                  <span className="text-sm text-red-600">Rupture de stock</span>
                )}
              </div>

              {/* Description */}
              {watchDescription && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(watchDescription || '', {
                        ALLOWED_TAGS: ['p', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'br'],
                        ALLOWED_ATTR: ['href', 'class', 'target', 'rel']
                      })
                    }}
                  />
                </div>
              )}

              {/* Caractéristiques techniques */}
              {watchedValues.technicalSpecs && (
                <div>
                  <h4 className="font-semibold mb-2">Caractéristiques techniques</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {watchedValues.technicalSpecs}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
