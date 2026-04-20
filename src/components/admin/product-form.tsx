"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import Image from "next/image";
import { Eye, Loader2 } from "lucide-react";

import { productFormSchema, type ProductFormData } from "@/lib/validators/product";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";
import { useDebounce } from "@/hooks/use-debounce";
import { signalDegradedMode } from "@/lib/admin/mock-data";

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
  TVA_20: 1.2,
  TVA_10: 1.1,
  TVA_5_5: 1.055,
  TVA_0: 1.0,
};

const LABEL_CLASS =
  "font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55";
const INPUT_CLASS =
  "mt-3 h-11 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 text-[15px] text-foreground shadow-none placeholder:text-foreground/30 focus-visible:border-foreground focus-visible:ring-0";
const INPUT_MONO_CLASS =
  "mt-3 h-11 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 font-mono text-[15px] tabular-nums text-foreground shadow-none placeholder:text-foreground/30 focus-visible:border-foreground focus-visible:ring-0";
const SECTION_CLASS = "space-y-6 border-b border-border/60 pb-10";
const ERROR_CLASS =
  "mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-destructive";

function SectionHeader({ index, label }: { index: string; label: string }) {
  return (
    <header className="flex items-center gap-3">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-primary"
      />
      <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55">
        {index} — {label}
      </h2>
    </header>
  );
}

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
    mode: "onChange",
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
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(() => {
        // Silent fallback — DB unavailable in dev backdoor mode
        signalDegradedMode();
        setCategories([]);
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
        .replace(/-{2,}/g, "-");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [debouncedName, productId, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      const url = productId
        ? `/api/admin/products/${productId}`
        : `/api/admin/products`;
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
        toast.success(
          productId
            ? "Produit mis à jour avec succès"
            : "Produit créé avec succès"
        );
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
      <div className="flex items-center justify-center border border-border/60 bg-foreground/[0.02] py-16">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Chargement
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl space-y-10"
      >
        {/* Section 01 — Identification */}
        <section className={SECTION_CLASS}>
          <SectionHeader index="01" label="Identification" />

          <div>
            <Label htmlFor="name" className={LABEL_CLASS}>
              Nom du produit *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Stéthoscope électronique 3M Littmann"
              disabled={isLoading}
              className={INPUT_CLASS}
            />
            {errors.name && <p className={ERROR_CLASS}>{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="slug" className={LABEL_CLASS}>
              Slug SEO *
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="Ex: stethoscope-electronique-3m-littmann"
              disabled={isLoading}
              className={`${INPUT_CLASS} font-mono`}
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              URL — /products/{watchedValues.slug || "…"}
            </p>
            {errors.slug && <p className={ERROR_CLASS}>{errors.slug.message}</p>}
          </div>

          <div>
            <Label htmlFor="sku" className={LABEL_CLASS}>
              SKU (optionnel)
            </Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="Ex: STH-3M-001"
              disabled={isLoading}
              className={`${INPUT_CLASS} font-mono`}
            />
            {errors.sku && <p className={ERROR_CLASS}>{errors.sku.message}</p>}
          </div>

          <div>
            <Label htmlFor="categoryId" className={LABEL_CLASS}>
              Catégorie
            </Label>
            <div className="mt-3 border-b border-border/60">
              <select
                id="categoryId"
                value={watchedValues.categoryId || ""}
                onChange={(e) =>
                  setValue("categoryId", e.target.value || null, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isLoading}
                className="h-11 w-full appearance-none bg-transparent pr-6 text-[15px] text-foreground focus:outline-none disabled:opacity-50"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <p className={ERROR_CLASS}>{errors.categoryId.message}</p>
            )}
          </div>
        </section>

        {/* Section 02 — Description */}
        <section className={SECTION_CLASS}>
          <SectionHeader index="02" label="Description" />

          <div>
            <Label className={LABEL_CLASS}>Description marketing</Label>
            <div className="mt-3">
              <RichTextEditor
                value={watchDescription || ""}
                onChange={(html) =>
                  setValue("description", html, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                placeholder="Décrivez les avantages et caractéristiques du produit…"
                disabled={isLoading}
              />
            </div>
            {errors.description && (
              <p className={ERROR_CLASS}>{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="technicalSpecs" className={LABEL_CLASS}>
              Spécifications techniques
            </Label>
            <Textarea
              id="technicalSpecs"
              {...register("technicalSpecs")}
              placeholder="Ex: Dimensions, poids, matériaux, certifications…"
              rows={5}
              disabled={isLoading}
              className="mt-3 resize-none rounded-none border-x-0 border-t-0 border-b border-border/60 bg-transparent px-0 text-[15px] text-foreground shadow-none placeholder:text-foreground/30 focus-visible:border-foreground focus-visible:ring-0"
            />
            {errors.technicalSpecs && (
              <p className={ERROR_CLASS}>{errors.technicalSpecs.message}</p>
            )}
          </div>
        </section>

        {/* Section 03 — Prix & TVA */}
        <section className={SECTION_CLASS}>
          <SectionHeader index="03" label="Prix & stock" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="price" className={LABEL_CLASS}>
                Prix HT (€) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                placeholder="99.99"
                disabled={isLoading}
                className={INPUT_MONO_CLASS}
              />
              {errors.price && (
                <p className={ERROR_CLASS}>{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="comparePrice" className={LABEL_CLASS}>
                Prix barré HT (€)
              </Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                {...register("comparePrice", {
                  setValueAs: (v) =>
                    v === "" || v === null ? null : parseFloat(v),
                })}
                placeholder="129.99"
                disabled={isLoading}
                className={INPUT_MONO_CLASS}
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                Optionnel — affiché barré en cas de promo
              </p>
              {errors.comparePrice && (
                <p className={ERROR_CLASS}>{errors.comparePrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tva" className={LABEL_CLASS}>
                Taux de TVA *
              </Label>
              <div className="mt-3 border-b border-border/60">
                <select
                  id="tva"
                  value={watchTva}
                  onChange={(e) =>
                    setValue(
                      "tva",
                      e.target.value as
                        | "TVA_20"
                        | "TVA_10"
                        | "TVA_5_5"
                        | "TVA_0",
                      { shouldValidate: true, shouldDirty: true }
                    )
                  }
                  disabled={isLoading}
                  className="h-11 w-full appearance-none bg-transparent pr-6 font-mono text-[15px] tabular-nums text-foreground focus:outline-none disabled:opacity-50"
                >
                  {Object.entries(TVA_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/40">
                TTC —{" "}
                {calculatePriceTTC(watchPrice || 0, watchTva).toFixed(2)} €
              </p>
              {errors.tva && <p className={ERROR_CLASS}>{errors.tva.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock" className={LABEL_CLASS}>
                Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", { valueAsNumber: true })}
                placeholder="50"
                disabled={isLoading}
                className={INPUT_MONO_CLASS}
              />
              {errors.stock && (
                <p className={ERROR_CLASS}>{errors.stock.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 04 — Images */}
        <section className={SECTION_CLASS}>
          <SectionHeader index="04" label="Images" />

          <div>
            <Label className={LABEL_CLASS}>Galerie produit</Label>
            <div className="mt-3">
              <MultiImageUpload
                value={watchImages}
                onChange={(urls) =>
                  setValue("images", urls, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isLoading}
              />
            </div>
            {errors.images && (
              <p className={ERROR_CLASS}>{errors.images.message}</p>
            )}
          </div>
        </section>

        {/* Section 05 — Options */}
        <section className={SECTION_CLASS}>
          <SectionHeader index="05" label="Options & publication" />

          <div>
            <Label htmlFor="priority" className={LABEL_CLASS}>
              Priorité d&apos;affichage —{" "}
              <span className="tabular-nums text-foreground">
                {watchPriority}
              </span>
            </Label>
            <div className="pt-4">
              <Slider
                id="priority"
                value={[watchPriority]}
                onValueChange={([value]) =>
                  setValue("priority", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                min={0}
                max={100}
                step={1}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              0 = Normal · 100 = Max · Influence l&apos;ordre d&apos;apparition
            </p>
            {errors.priority && (
              <p className={ERROR_CLASS}>{errors.priority.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-6 border border-border/60 p-5">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
                Produit mis en avant
              </p>
              <p className="text-[13px] text-foreground/55">
                Affiché dans les sélections spéciales et la page d&apos;accueil.
              </p>
            </div>
            <Switch
              id="featured"
              checked={watchedValues.featured}
              onCheckedChange={(checked) =>
                setValue("featured", checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="status" className={LABEL_CLASS}>
              Statut de publication *
            </Label>
            <div className="mt-3 border-b border-border/60">
              <select
                id="status"
                value={watchedValues.status}
                onChange={(e) =>
                  setValue("status", e.target.value as "DRAFT" | "PUBLISHED", {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isLoading}
                className="h-11 w-full appearance-none bg-transparent pr-6 text-[15px] text-foreground focus:outline-none disabled:opacity-50"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
              </select>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              Seuls les produits publiés sont visibles sur le site
            </p>
            {errors.status && (
              <p className={ERROR_CLASS}>{errors.status.message}</p>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={isLoading || !watchedValues.name}
            className="inline-flex h-10 items-center gap-2 rounded-none border border-border/60 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground disabled:opacity-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Prévisualiser
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
              className="h-10 rounded-none px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || (!!productId && !isDirty)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading
                ? "Enregistrement"
                : productId
                  ? "Mettre à jour"
                  : watchedValues.status === "PUBLISHED"
                    ? "Publier"
                    : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>

      {/* Modal de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
              — Prévisualisation
            </p>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Aperçu produit
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Rendu tel qu&apos;il apparaîtra sur le site public.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {watchImages.length > 0 ? (
              <div className="relative aspect-square overflow-hidden border border-border/60">
                <Image
                  src={watchImages[0]}
                  alt={watchedValues.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center border border-dashed border-border/60 bg-foreground/[0.02]">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                  Aucune image
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  {watchedValues.name || "Nom du produit"}
                </h3>
                {watchedValues.sku && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                    SKU · {watchedValues.sku}
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold tabular-nums text-foreground">
                  {calculatePriceTTC(watchPrice || 0, watchTva).toFixed(2)} €
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                  TTC
                </span>
                {watchedValues.comparePrice && (
                  <span className="font-mono text-base tabular-nums text-foreground/40 line-through">
                    {calculatePriceTTC(
                      watchedValues.comparePrice,
                      watchTva
                    ).toFixed(2)}{" "}
                    €
                  </span>
                )}
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/45">
                HT · {(watchPrice || 0).toFixed(2)} € — TVA ·{" "}
                {TVA_LABELS[watchTva]}
              </p>

              <div>
                {watchedValues.stock > 0 ? (
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    En stock · {watchedValues.stock}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-destructive">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Rupture de stock
                  </span>
                )}
              </div>

              {watchDescription && (
                <div className="border-t border-border/60 pt-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    — Description
                  </p>
                  <div
                    className="prose prose-sm max-w-none text-foreground/80"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(watchDescription || "", {
                        ALLOWED_TAGS: [
                          "p",
                          "strong",
                          "em",
                          "h2",
                          "h3",
                          "ul",
                          "ol",
                          "li",
                          "a",
                          "br",
                        ],
                        ALLOWED_ATTR: ["href", "class", "target", "rel"],
                      }),
                    }}
                  />
                </div>
              )}

              {watchedValues.technicalSpecs && (
                <div className="border-t border-border/60 pt-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    — Spécifications techniques
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground/70">
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
