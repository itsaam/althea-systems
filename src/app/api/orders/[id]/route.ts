import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
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
import { sendOrderStatusChangeEmail } from "@/lib/email";

const emailsEnabled = () => process.env.EMAILS_ENABLED !== "false";

export const dynamic = "force-dynamic";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().nullable().optional(),
  paymentMethod: z.string().optional(),
  paymentIntentId: z.string().optional(),
  notes: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiLogger(async (
  _req: NextRequest,
  context: unknown
) => {
  let currentId = "unknown";
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Vous devez être connecté", 401);

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
              select: { id: true, name: true, slug: true, images: true, tva: true },
            },
          },
        },
        invoice: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) return loggedErrorResponse("Commande introuvable", 404);

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
      invoice: order.invoice
        ? { ...order.invoice, amount: Number(order.invoice.amount) }
        : null,
      tvaBreakdown: totals.tvaBreakdown,
    };

    return loggedSuccessResponse({ order: serializedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur GET order [${currentId}]: ${message}`);
    return loggedErrorResponse(`Erreur récupération commande: ${message}`, 500);
  }
});

export const PATCH = withApiLogger(async (
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
    const validatedData = updateOrderSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        orderNumber: true,
        paymentDate: true,
        user: { select: { email: true } },
      },
    });

    if (!existingOrder) return loggedErrorResponse("Commande introuvable", 404);

    const updateData: Prisma.OrderUpdateInput = { ...validatedData };
    const statusChanged =
      !!validatedData.status && validatedData.status !== existingOrder.status;
    const previousStatus = existingOrder.status;

    if (statusChanged) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: validatedData.status!,
          changedBy: session.user.id,
        },
      });
      apiLogger.info(
        `Statut commande ${existingOrder.orderNumber} : ${existingOrder.status} → ${validatedData.status}`
      );
    }

    if (validatedData.paymentStatus === "PAID" && !existingOrder.paymentDate) {
      updateData.paymentDate = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true, tva: true },
            },
          },
        },
        address: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        invoice: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (statusChanged && emailsEnabled() && order.user?.email) {
      try {
        await sendOrderStatusChangeEmail(
          order.user.email,
          order.orderNumber,
          validatedData.status!,
          previousStatus
        );
      } catch (emailError) {
        const emailMsg =
          emailError instanceof Error ? emailError.message : "Erreur inconnue";
        apiLogger.warn(
          `Email statut commande ${order.orderNumber} non envoyé: ${emailMsg}`
        );
      }
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
      invoice: order.invoice
        ? { ...order.invoice, amount: Number(order.invoice.amount) }
        : null,
      tvaBreakdown: totals.tvaBreakdown,
    };

    return loggedSuccessResponse(
      { order: serializedOrder },
      "Commande mise à jour avec succès"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur PATCH order [${currentId}]: ${message}`);
    return loggedErrorResponse(`Erreur mise à jour commande: ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (
  _req: NextRequest,
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
      include: {
        items: true,
        user: { select: { email: true } },
      },
    });

    if (!order) return loggedErrorResponse("Commande introuvable", 404);

    if (session.user.role !== "ADMIN" && session.user.id !== order.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return loggedErrorResponse(
        "Impossible d'annuler une commande déjà expédiée ou livrée",
        400
      );
    }

    await prisma.$transaction([
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          changedBy: session.user.id,
        },
      }),
      prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);

    apiLogger.warn(
      `Commande ${order.orderNumber} annulée par ${session.user.email}`
    );

    if (emailsEnabled() && order.user?.email) {
      try {
        await sendOrderStatusChangeEmail(
          order.user.email,
          order.orderNumber,
          OrderStatus.CANCELLED,
          order.status
        );
      } catch (emailError) {
        const emailMsg =
          emailError instanceof Error ? emailError.message : "Erreur inconnue";
        apiLogger.warn(
          `Email annulation commande ${order.orderNumber} non envoyé: ${emailMsg}`
        );
      }
    }

    return loggedSuccessResponse(
      { message: "Commande annulée et stock restauré" },
      "Commande annulée avec succès"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur DELETE order [${currentId}]: ${message}`);
    return loggedErrorResponse("Erreur lors de l'annulation", 500);
  }
});