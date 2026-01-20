import { z } from "zod";

// Schéma pour le formulaire de création/édition de produit
export const productFormSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  slug: z.string().min(1, "Slug requis").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex: mon-produit)"),
  description: z.string().optional().nullable(),
  technicalSpecs: z.string().optional().nullable(),
  price: z.number().positive("Prix invalide"),
  comparePrice: z.number().positive().optional().nullable(),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]),
  sku: z.string().optional().nullable(),
  stock: z.number().int().min(0, "Stock >= 0"),
  priority: z.number().int().min(0).max(100),
  images: z.array(z.string().url()),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Schéma pour la validation en API (accepte aussi des strings pour les nombres)
export const productApiSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  slug: z.string().min(1, "Slug requis"),
  description: z.string().optional().nullable(),
  technicalSpecs: z.string().optional().nullable(),
  price: z.coerce.number().positive("Prix invalide"),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock >= 0"),
  priority: z.coerce.number().int().min(0).max(100).default(0),
  images: z.array(z.string().url()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string().optional().nullable(),
});

// Legacy schemas (à migrer progressivement)
export const productSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(200, "Nom trop long"),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10, "Description trop courte"),
  price: z.number().positive("Le prix doit être positif"),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1, "Au moins une image requise"),
  categoryId: z.string().min(1, "Catégorie requise"),
  stock: z.number().int().min(0, "Stock invalide"),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort: z
    .enum(["name", "price", "createdAt", "-name", "-price", "-createdAt"])
    .default("-createdAt"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
