<<<<<<< Updated upstream
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all orders
  return NextResponse.json({ orders: [] });
}

export async function POST() {
  // TODO: Create order
  return NextResponse.json({ message: "Order created" });
}
=======
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";
import {
  calculateCartTotals,
  type CartItem,
} from "@/lib/tva-utils";

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

const updateOrderSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  paymentMethod: z.string().optional(),
  paymentIntentId: z.string().optional(),
  notes: z.string().optional(),
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

function calculateShippingCost(subtotal: number, country: string): number {
  if (subtotal >= 100) return 0;
  if (country === "France" || country === "FR") return 5.99;
  const euCountries = ["BE", "DE", "ES", "IT", "NL", "PT", "LU", "AT", "IE", "GR"];
  if (euCountries.includes(country)) return 9.99;
  return 19.99;
}

// GET ORDERS
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          address: true,
          items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
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
    apiLogger.error(`GET orders error: ${message}`);
    return loggedErrorResponse(`Erreur récupération commandes: ${message}`, 500);
  }
});

//  POST CREATE ORDER - VERSION AMÉLIORÉE AVEC CALCULS TVA
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = orderSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: validatedData.userId } });
    if (!user) return loggedErrorResponse("Utilisateur non trouvé", 404);

    const address = await prisma.address.findUnique({ where: { id: validatedData.addressId } });
    if (!address) return loggedErrorResponse("Adresse non trouvée", 404);
    if (address.userId !== validatedData.userId)
      return loggedErrorResponse("Cette adresse ne vous appartient pas", 403);

    const productIds = validatedData.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      select: { id: true, name: true, price: true, tva: true, stock: true },
    });
    if (products.length !== productIds.length) {
      const missing = productIds.filter((id) => !products.some((p) => p.id === id));
      return loggedErrorResponse(`Produits non trouvés ou indisponibles: ${missing.join(", ")}`, 400);
    }

    // Check stock
    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      if (product.stock < item.quantity)
        return loggedErrorResponse(
          `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, demandé: ${item.quantity}`,
          400
        );
    }

    // ✅ NOUVEAU : Préparation des items pour le calcul TVA automatique
    const cartItems: CartItem[] = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produit non trouvé");
      
      return {
        priceHT: Number(product.price),
        tvaRate: product.tva,
        quantity: item.quantity,
      };
    });

    // ✅ NOUVEAU : Calcul des frais de port (basé sur le HT)
    const tempTotals = calculateCartTotals(cartItems);
    const shippingCost = calculateShippingCost(tempTotals.subtotalHT, address.country);

    // ✅ NOUVEAU : Calcul final avec frais de port
    const totals = calculateCartTotals(cartItems, shippingCost);

    // Préparation des items pour la commande (inchangé)
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produit non trouvé");

      return { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: item.quantity 
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: validatedData.userId,
          addressId: validatedData.addressId,
          subtotal: totals.subtotalHT,                    // ✅ MODIFIÉ
          shippingCost: totals.shippingCost || 0,         // ✅ MODIFIÉ
          tax: totals.totalTVA,                           // ✅ MODIFIÉ
          total: totals.grandTotal || totals.totalTTC,    // ✅ MODIFIÉ
          notes: validatedData.notes,
          paymentMethod: validatedData.paymentMethod,
          items: { create: orderItems },
          statusHistory: { create: { status: "PENDING" } },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, slug: true, images: true, price: true } } } },
          address: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      });

      // Update stock
      await Promise.all(
        validatedData.items.map((item) =>
          tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
        )
      );

      return newOrder;
    });

    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
      tvaBreakdown: totals.tvaBreakdown,  // ✅ AJOUTÉ : Détail TVA par taux
    };

    apiLogger.info(`Commande créée: ${order.orderNumber} - Total: ${totals.grandTotal || totals.totalTTC}€ (TVA: ${totals.totalTVA}€)`);

    return loggedSuccessResponse({ order: serializedOrder }, "Commande créée avec succès", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(`Données invalides: ${error.issues.map((i) => i.message).join(", ")}`, 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur création commande: ${message}`, 500);
  }
});

// ----- PATCH UPDATE ORDER (ADMIN) -----
export const PATCH = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const { id } = (context as { params: { id: string } }).params;
    const body = await req.json();
    const validatedData = updateOrderSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) return loggedErrorResponse("Commande non trouvée", 404);

    const updateData: Record<string, unknown> = { ...validatedData };

    if (validatedData.status && validatedData.status !== existingOrder.status) {
      await prisma.orderStatusHistory.create({
        data: { orderId: id, status: validatedData.status, changedBy: session.user.id },
      });
    }

    if (validatedData.paymentStatus === "PAID" && !existingOrder.paymentDate) {
      updateData.paymentDate = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        address: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
    };

    return loggedSuccessResponse({ order: serializedOrder }, "Commande mise à jour avec succès");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(`Données invalides: ${error.issues.map((i) => i.message).join(", ")}`, 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour commande: ${message}`, 500);
  }
});

// ----- DELETE ORDER (ADMIN) -----
export const DELETE = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const { id } = (context as { params: { id: string } }).params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return loggedErrorResponse("Commande non trouvée", 404);

    if (["DELIVERED", "SHIPPED"].includes(order.status)) {
      return loggedErrorResponse("Impossible d'annuler une commande livrée ou expédiée", 400);
    }

    await prisma.$transaction([
      prisma.orderStatusHistory.create({ data: { orderId: id, status: "CANCELLED", changedBy: session.user.id } }),
      prisma.order.update({ where: { id }, data: { status: "CANCELLED" } }),
      ...order.items.map((item) =>
        prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      ),
    ]);

    return loggedSuccessResponse({ message: "Commande annulée avec succès" }, "Commande annulée");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur annulation commande: ${message}`, 500);
  }
});
>>>>>>> Stashed changes
