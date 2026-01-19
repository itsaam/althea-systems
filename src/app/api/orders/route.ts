import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  userId: z.string(),
  addressId: z.string(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${year}${month}-${random}`;
}

function getTvaRate(tva: string): number {
  const rates: Record<string, number> = {
    TVA_20: 0.2,
    TVA_10: 0.1,
    TVA_5_5: 0.055,
    TVA_0: 0.0,
  };
  return rates[tva] || 0.2;
}

function calculateShippingCost(subtotal: number, country: string): number {
  if (subtotal >= 100) return 0;

  if (country === "France" || country === "FR") return 5.99;

  const euCountries = ["BE", "DE", "ES", "IT", "NL", "PT", "LU", "AT", "IE", "GR"];
  if (euCountries.includes(country)) return 9.99;

  return 19.99;
}

// GET Liste des commandes
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: order.subtotal.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      tax: order.tax.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    }));

    return loggedSuccessResponse({
      orders: serializedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération commandes: ${message}`, 500);
  }
});

// POST Créer une commande
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = orderSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return loggedErrorResponse("Utilisateur non trouvé", 404);
    }

    const address = await prisma.address.findUnique({
      where: { id: validatedData.addressId },
    });

    if (!address) {
      return loggedErrorResponse("Adresse non trouvée", 404);
    }

    if (address.userId !== validatedData.userId) {
      return loggedErrorResponse("Cette adresse ne vous appartient pas", 403);
    }

    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        price: true,
        tva: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return loggedErrorResponse(
        `Produits non trouvés ou non disponibles: ${missingIds.join(", ")}`,
        400
      );
    }

    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        return loggedErrorResponse(
          `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, Demandé: ${item.quantity}`,
          400
        );
      }
    }

    let subtotal = 0;
    let totalTax = 0;

    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produit non trouvé");

      const priceHT = Number(product.price);
      const itemSubtotal = priceHT * item.quantity;
      const tvaRate = getTvaRate(product.tva);
      const itemTax = itemSubtotal * tvaRate;

      subtotal += itemSubtotal;
      totalTax += itemTax;

      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const shippingCost = calculateShippingCost(subtotal, address.country);
    const total = subtotal + totalTax + shippingCost;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: validatedData.userId,
          addressId: validatedData.addressId,
          subtotal,
          shippingCost,
          tax: totalTax,
          total,
          notes: validatedData.notes,
          paymentMethod: validatedData.paymentMethod,
          items: {
            create: orderItems,
          },
          statusHistory: {
            create: {
              status: "PENDING",
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await Promise.all(
        validatedData.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      return newOrder;
    });

    const serializedOrder = {
      ...order,
      subtotal: order.subtotal.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      tax: order.tax.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    };

    return loggedSuccessResponse(
      { order: serializedOrder },
      "Commande créée avec succès",
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur création commande: ${message}`, 500);
  }
});