// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";
import {
  contactSchema,
} from "@/lib/validators/contact";
import {
  addressSchema,
  orderItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from "@/lib/validators/order";
import {
  productFormSchema,
  productFilterSchema,
} from "@/lib/validators/product";

// ─── loginSchema ──────────────────────────────────────────────
describe("loginSchema", () => {
  it("valide un login correct", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "password" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

// ─── registerSchema ───────────────────────────────────────────
describe("registerSchema", () => {
  const valid = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@example.com",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("valide une inscription correcte", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "AutrePass1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejette un mot de passe sans majuscule", () => {
    const result = registerSchema.safeParse({ ...valid, password: "password1", confirmPassword: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe sans chiffre", () => {
    const result = registerSchema.safeParse({ ...valid, password: "Password", confirmPassword: "Password" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe trop court", () => {
    const result = registerSchema.safeParse({ ...valid, password: "Pass1", confirmPassword: "Pass1" });
    expect(result.success).toBe(false);
  });

  it("rejette un prénom trop court", () => {
    const result = registerSchema.safeParse({ ...valid, firstName: "J" });
    expect(result.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    const result = registerSchema.safeParse({ ...valid, email: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ─── forgotPasswordSchema ─────────────────────────────────────
describe("forgotPasswordSchema", () => {
  it("valide un email correct", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejette un email invalide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
  });
});

// ─── resetPasswordSchema ──────────────────────────────────────
describe("resetPasswordSchema", () => {
  const valid = { token: "abc123", password: "NewPass1!", confirmPassword: "NewPass1!" };

  it("valide une réinitialisation correcte", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette si les mots de passe ne correspondent pas", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe trop court", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, password: "abc", confirmPassword: "abc" });
    expect(result.success).toBe(false);
  });
});

// ─── contactSchema ────────────────────────────────────────────
describe("contactSchema (validators)", () => {
  const valid = {
    name: "Jean Dupont",
    email: "jean@example.com",
    subject: "Question sur un produit",
    message: "Bonjour, j'aimerais avoir plus d'informations sur votre produit.",
  };

  it("valide un message correct", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un nom trop court", () => {
    expect(contactSchema.safeParse({ ...valid, name: "J" }).success).toBe(false);
  });

  it("rejette un sujet trop court", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "Qst" }).success).toBe(false);
  });

  it("rejette un message trop court", () => {
    expect(contactSchema.safeParse({ ...valid, message: "Court" }).success).toBe(false);
  });

  it("rejette un message trop long", () => {
    expect(contactSchema.safeParse({ ...valid, message: "a".repeat(5001) }).success).toBe(false);
  });

  it("rejette un email invalide", () => {
    expect(contactSchema.safeParse({ ...valid, email: "invalid" }).success).toBe(false);
  });
});

// ─── addressSchema ────────────────────────────────────────────
describe("addressSchema (order)", () => {
  const valid = {
    firstName: "Jean",
    lastName: "Dupont",
    address: "12 rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    country: "FR",
  };

  it("valide une adresse correcte", () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });

  it("applique FR comme pays par défaut", () => {
    const { country: _country, ...rest } = valid;
    const result = addressSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.country).toBe("FR");
  });

  it("rejette une adresse trop courte", () => {
    expect(addressSchema.safeParse({ ...valid, address: "12" }).success).toBe(false);
  });

  it("rejette un code postal trop court", () => {
    expect(addressSchema.safeParse({ ...valid, postalCode: "75" }).success).toBe(false);
  });
});

// ─── orderItemSchema ──────────────────────────────────────────
describe("orderItemSchema", () => {
  it("valide un item correct", () => {
    expect(orderItemSchema.safeParse({ productId: "prod_123", quantity: 2 }).success).toBe(true);
  });

  it("rejette une quantité à 0", () => {
    expect(orderItemSchema.safeParse({ productId: "prod_123", quantity: 0 }).success).toBe(false);
  });

  it("rejette une quantité négative", () => {
    expect(orderItemSchema.safeParse({ productId: "prod_123", quantity: -1 }).success).toBe(false);
  });
});

// ─── createOrderSchema ────────────────────────────────────────
describe("createOrderSchema", () => {
  const validAddress = {
    firstName: "Jean",
    lastName: "Dupont",
    address: "12 rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    country: "FR",
  };

  it("valide une commande correcte", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "prod_123", quantity: 1 }],
      shippingAddress: validAddress,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un panier vide", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      shippingAddress: validAddress,
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateOrderStatusSchema ──────────────────────────────────
describe("updateOrderStatusSchema", () => {
  it("valide un statut correct", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "shipped" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "delivered" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "cancelled" }).success).toBe(true);
  });

  it("rejette un statut invalide", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "INVALID" }).success).toBe(false);
  });

  it("accepte un numéro de suivi optionnel", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "shipped", trackingNumber: "TRACK123" });
    expect(result.success).toBe(true);
  });
});

// ─── productFormSchema ────────────────────────────────────────
describe("productFormSchema", () => {
  const valid = {
    name: "MacBook Pro",
    slug: "macbook-pro",
    price: 1999.99,
    tva: "TVA_20",
    stock: 10,
    priority: 0,
    images: [],
    featured: false,
    status: "PUBLISHED",
  };

  it("valide un produit correct", () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un slug avec majuscules", () => {
    const result = productFormSchema.safeParse({ ...valid, slug: "MacBook-Pro" });
    expect(result.success).toBe(false);
  });

  it("rejette un slug avec espaces", () => {
    const result = productFormSchema.safeParse({ ...valid, slug: "macbook pro" });
    expect(result.success).toBe(false);
  });

  it("rejette une priorité > 100", () => {
    const result = productFormSchema.safeParse({ ...valid, priority: 101 });
    expect(result.success).toBe(false);
  });

  it("rejette plus de 10 images", () => {
    const result = productFormSchema.safeParse({
      ...valid,
      images: Array(11).fill("https://example.com/img.jpg"),
    });
    expect(result.success).toBe(false);
  });

  it("rejette un prix négatif", () => {
    expect(productFormSchema.safeParse({ ...valid, price: -10 }).success).toBe(false);
  });

  it("rejette un stock négatif", () => {
    expect(productFormSchema.safeParse({ ...valid, stock: -1 }).success).toBe(false);
  });

  it("rejette un status invalide", () => {
    expect(productFormSchema.safeParse({ ...valid, status: "INVALID" }).success).toBe(false);
  });

  it("rejette un taux TVA invalide", () => {
    expect(productFormSchema.safeParse({ ...valid, tva: "TVA_99" }).success).toBe(false);
  });
});

// ─── productFilterSchema ──────────────────────────────────────
describe("productFilterSchema", () => {
  it("valide des filtres corrects", () => {
    const result = productFilterSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
  });

  it("applique les valeurs par défaut", () => {
    const result = productFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sort).toBe("-createdAt");
    }
  });

  it("rejette un limit > 100", () => {
    expect(productFilterSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejette un sort invalide", () => {
    expect(productFilterSchema.safeParse({ sort: "invalid" }).success).toBe(false);
  });

  it("rejette une page à 0", () => {
    expect(productFilterSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});