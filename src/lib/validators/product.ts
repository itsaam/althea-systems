import { z } from "zod";

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
