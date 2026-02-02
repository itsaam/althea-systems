import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import {
  calculateCartTotals,
  type CartItem,
} from "@/lib/tva-utils";
import type { Prisma } from "@prisma/client";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().nullable().optional(),
});

export const GET = withApiLogger(async (
  _req: NextRequest,
  context: unknown 
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non autorisé", 401);
    
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        address: true,
        items: { include: { product: true } },
        invoice: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) return loggedErrorResponse("Commande non trouvée", 404);
    
    if (session.user.role !== "ADMIN" && session.user.id !== order.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

    const cartItems: CartItem[] = order.items.map((item) => ({
      priceHT: item.price.toNumber(),
      tvaRate: item.product.tva,
      quantity: item.quantity,
    }));

    const totals = calculateCartTotals(cartItems, order.shippingCost.toNumber());

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
      invoice: order.invoice
        ? { ...order.invoice, amount: order.invoice.amount.toNumber() }
        : null,
      tvaBreakdown: totals.tvaBreakdown,  
    };

    return loggedSuccessResponse({ order: serializedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération commande: ${message}`, 500);
  }
});

export const PATCH = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const body = await req.json();
    
    const validatedData = updateOrderSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) return loggedErrorResponse("Commande non trouvée", 404);

    const updateData: Prisma.OrderUpdateInput = {
      status: validatedData.status,
      paymentStatus: validatedData.paymentStatus
    };

    if (validatedData.status && validatedData.status !== existingOrder.status) {
      await prisma.orderStatusHistory.create({
        data: { 
          orderId: id, 
          status: validatedData.status, 
          changedBy: session.user.id 
        },
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
      subtotal: order.subtotal.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      tax: order.tax.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map((item) => ({ ...item, price: item.price.toNumber() })),
    };

    return loggedSuccessResponse({ order: serializedOrder }, "Commande mise à jour avec succès");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map(i => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour commande: ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (
  _req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return loggedErrorResponse("Commande non trouvée", 404);
    
    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return loggedErrorResponse("Impossible d'annuler une commande livrée ou expédiée", 400);
    }

    await prisma.$transaction([
      prisma.orderStatusHistory.create({
        data: { 
          orderId: id, 
          status: OrderStatus.CANCELLED, 
          changedBy: session.user.id 
        },
      }),
      prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED } }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);

    return loggedSuccessResponse({ message: "Commande annulée avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur annulation commande: ${message}`, 500);
  }
});