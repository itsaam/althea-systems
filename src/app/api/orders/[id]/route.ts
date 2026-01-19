import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

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

export const GET = withApiLogger(async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { id } = context.params;

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

    if (!order) {
      return loggedErrorResponse("Commande non trouvée", 404);
    }

    if (!session) {
      return loggedErrorResponse("Non autorisé", 401);
    }

    if (session.user.role !== "ADMIN" && session.user.id !== order.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

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
    };

    return loggedSuccessResponse({ order: serializedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération commande: ${message}`, 500);
  }
});

// PATCH (Admin only) 
export const PATCH = withApiLogger(async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = context.params;
    const body = await req.json();
    const validatedData = updateOrderSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return loggedErrorResponse("Commande non trouvée", 404);
    }

    const updateData: any = { ...validatedData };

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

// DELETE (Admin only) 
export const DELETE = withApiLogger(async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return loggedErrorResponse("Commande non trouvée", 404);
    }

    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return loggedErrorResponse("Impossible d'annuler une commande livrée ou expédiée", 400);
    }

    await prisma.$transaction([
      prisma.orderStatusHistory.create({
        data: { orderId: id, status: "CANCELLED", changedBy: session.user.id },
      }),
      prisma.order.update({ where: { id }, data: { status: "CANCELLED" } }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);

    return loggedSuccessResponse({ message: "Commande annulée avec succès" }, "Commande annulée");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur annulation commande: ${message}`, 500);
  }
});
