import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal requis"),
  country: z.string().min(2, "Pays requis").default("FR"),
  phone: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Le panier est vide"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddress: z.boolean().default(true),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
