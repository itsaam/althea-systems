import { describe, it, expect } from "vitest";
import { z } from "zod";

// ─── Schemas extraits des routes (copie des validators) ───────
// Ces schemas sont testés indépendamment de la DB

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Le prix doit être positif"),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]).default("TVA_20"),
  priority: z.number().int().default(0),
});

const addressSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  street: z.string().min(1, "Rue requise"),
  street2: z.string().optional(),
  city: z.string().min(1, "Ville requise"),
  region: z.string().optional(),
  postalCode: z.string().min(1, "Code postal requis"),
  country: z.string().min(1, "Pays requis"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  currentPassword: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

// ─── productSchema ────────────────────────────────────────────
describe("productSchema", () => {
  it("valide un produit complet", () => {
    const result = productSchema.safeParse({
      name: "MacBook Pro",
      slug: "macbook-pro",
      price: 1999.99,
      stock: 10,
      status: "PUBLISHED",
      tva: "TVA_20",
    });
    expect(result.success).toBe(true);
  });

  it("applique les valeurs par défaut", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock).toBe(0);
      expect(result.data.featured).toBe(false);
      expect(result.data.status).toBe("DRAFT");
      expect(result.data.tva).toBe("TVA_20");
      expect(result.data.images).toEqual([]);
    }
  });

  it("rejette si nom manquant", () => {
    const result = productSchema.safeParse({ slug: "test", price: 10 });
    expect(result.success).toBe(false);
  });

  it("rejette si prix négatif", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: -10 });
    expect(result.success).toBe(false);
  });

  it("rejette si prix à zéro", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejette un stock négatif", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 10, stock: -1 });
    expect(result.success).toBe(false);
  });

  it("rejette un status invalide", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 10, status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejette un taux TVA invalide", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 10, tva: "TVA_99" });
    expect(result.success).toBe(false);
  });

  it("accepte description null", () => {
    const result = productSchema.safeParse({ name: "Test", slug: "test", price: 10, description: null });
    expect(result.success).toBe(true);
  });
});

// ─── addressSchema ────────────────────────────────────────────
describe("addressSchema", () => {
  const validAddress = {
    firstName: "Jean",
    lastName: "Dupont",
    street: "12 rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    country: "France",
  };

  it("valide une adresse complète", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("valide avec les champs optionnels", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      street2: "Apt 3",
      phone: "+33612345678",
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejette si prénom manquant", () => {
    const { firstName: _firstName, ...rest } = validAddress;
    const result = addressSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejette si ville manquante", () => {
    const { city: _city, ...rest } = validAddress;
    const result = addressSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejette les champs requis vides", () => {
    const result = addressSchema.safeParse({ ...validAddress, country: "" });
    expect(result.success).toBe(false);
  });
});

// ─── updateProfileSchema ──────────────────────────────────────
describe("updateProfileSchema", () => {
  it("valide une mise à jour partielle", () => {
    const result = updateProfileSchema.safeParse({ firstName: "Jean" });
    expect(result.success).toBe(true);
  });

  it("valide une mise à jour complète", () => {
    const result = updateProfileSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      phone: "+33612345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    const result = updateProfileSchema.safeParse({ password: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepte un mot de passe de 8 caractères minimum", () => {
    const result = updateProfileSchema.safeParse({ password: "password" });
    expect(result.success).toBe(true);
  });

  it("valide un objet vide", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejette firstName vide", () => {
    const result = updateProfileSchema.safeParse({ firstName: "" });
    expect(result.success).toBe(false);
  });
});

// ─── contactSchema ────────────────────────────────────────────
describe("contactSchema", () => {
  const validContact = {
    name: "Jean Dupont",
    email: "jean@example.com",
    subject: "Question",
    message: "Bonjour, j'ai une question sur votre produit.",
  };

  it("valide un message complet", () => {
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = contactSchema.safeParse({ ...validContact, email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un message trop court", () => {
    const result = contactSchema.safeParse({ ...validContact, message: "Court" });
    expect(result.success).toBe(false);
  });

  it("rejette un nom vide", () => {
    const result = contactSchema.safeParse({ ...validContact, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejette un sujet vide", () => {
    const result = contactSchema.safeParse({ ...validContact, subject: "" });
    expect(result.success).toBe(false);
  });

  it("accepte exactement 10 caractères dans le message", () => {
    const result = contactSchema.safeParse({ ...validContact, message: "1234567890" });
    expect(result.success).toBe(true);
  });
});