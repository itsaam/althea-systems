import { z } from "zod";

// Schéma pour le formulaire de création/édition de produit
export const productFormSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Format invalide : utiliser uniquement des lettres minuscules, chiffres et tirets (ex: stethoscope-3m)"
    ),
  description: z.string().optional().nullable(),
  technicalSpecs: z.string().optional().nullable(),
  price: z
    .number({ message: "Le prix doit être un nombre" })
    .positive("Le prix doit être supérieur à 0"),
  comparePrice: z
    .number({ message: "Le prix de comparaison doit être un nombre" })
    .positive("Le prix de comparaison doit être supérieur à 0")
    .optional()
    .nullable(),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"], {
    message: "Taux de TVA invalide : choisir 20%, 10%, 5.5% ou 0%"
  }),
  sku: z
    .string()
    .regex(/^[A-Z0-9-]*$/, "Le SKU ne peut contenir que des majuscules, chiffres et tirets")
    .optional()
    .nullable(),
  stock: z
    .number({ message: "Le stock doit être un nombre entier" })
    .int("Le stock doit être un nombre entier")
    .min(0, "Le stock ne peut pas être négatif"),
  priority: z
    .number()
    .int("La priorité doit être un nombre entier")
    .min(0, "La priorité doit être entre 0 et 100")
    .max(100, "La priorité doit être entre 0 et 100"),
  images: z
    .array(z.string().url("URL d'image invalide"))
    .max(10, "Maximum 10 images par produit"),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"], {
    message: "Statut invalide : choisir DRAFT (brouillon) ou PUBLISHED (publié)"
  }),
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
  images: z
    .array(
      z.string().url("URL invalide").refine(
        (url) => {
          // Accepter les URLs vides ou provenant de notre R2
          if (!url) return true;
          const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev";
          return url.startsWith(r2Url);
        },
        "Les images doivent provenir de notre CDN (R2)"
      )
    )
    .default([]),
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
