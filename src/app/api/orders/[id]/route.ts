import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
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

export const dynamic = 'force-dynamic';

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  let currentId = "unknown";
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return loggedErrorResponse("Vous devez être connecté", 401);
    }

    const { id } = await (context as RouteContext).params;
    currentId = id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        address: true,
        items: { 
          include: { 
            product: {
              select: { id: true, name: true, slug: true, images: true, tva: true }
            } 
          } 
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return loggedErrorResponse("Commande introuvable", 404);
    }

    if (session.user.role !== "ADMIN" && session.user.id !== order.userId) {
      return loggedErrorResponse("Accès non autorisé à cette commande", 403);
    }

    const cartItems: CartItem[] = order.items.map((item) => ({
      priceHT: Number(item.price),
      tvaRate: item.product.tva,
      quantity: item.quantity,
    }));

    const totals = calculateCartTotals(cartItems, Number(order.shippingCost));

    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
      tvaBreakdown: totals.tvaBreakdown,
    };

    return loggedSuccessResponse({ order: serializedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur GET order detail [${currentId}]: ${message}`);
    return loggedErrorResponse(`Erreur récupération commande: ${message}`, 500);
  }
});

export const PUT = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  let currentId = "unknown";
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Action réservée aux administrateurs", 403);
    }

    const { id } = await (context as RouteContext).params;
    currentId = id;
    
    const body = await req.json();
    const validatedData = updateStatusSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({ 
      where: { id },
      select: { id: true, status: true, orderNumber: true }
    });

    if (!existingOrder) {
      return loggedErrorResponse("Commande introuvable", 404);
    }

    if (existingOrder.status === validatedData.status) {
      return loggedErrorResponse(
        `La commande est déjà au statut ${validatedData.status}`,
        400
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: validatedData.status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: validatedData.status,
          changedBy: session.user.id
        },
      });

      return order;
    });

    apiLogger.info(`Statut commande ${existingOrder.orderNumber} mis à jour : ${existingOrder.status} -> ${validatedData.status}`);

    return loggedSuccessResponse(
      { order: updatedOrder },
      `Statut mis à jour vers ${validatedData.status} avec succès`
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(`Données invalides: ${error.issues[0].message}`, 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur mise à jour statut [${currentId}]: ${message}`);
    return loggedErrorResponse(`Erreur lors de la mise à jour: ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  let currentId = "unknown";
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non autorisé", 401);

    const { id } = await (context as RouteContext).params;
    currentId = id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return loggedErrorResponse("Commande non trouvée", 404);

    if (session.user.role !== "ADMIN" && session.user.id !== order.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return loggedErrorResponse("Impossible d'annuler une commande déjà expédiée", 400);
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED }
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          changedBy: session.user.id
        }
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);

    apiLogger.warn(`Commande ${order.orderNumber} annulée par ${session.user.email}`);
    return loggedSuccessResponse({ message: "Commande annulée et stock restauré" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur annulation [${currentId}]: ${message}`);
    return loggedErrorResponse("Erreur lors de l'annulation", 500);
  }
});
