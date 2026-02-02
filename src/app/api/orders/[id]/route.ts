<<<<<<< Updated upstream
import { NextResponse } from "next/server";
=======
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
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
>>>>>>> Stashed changes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Fetch order by id
  return NextResponse.json({ order: { id } });
}

<<<<<<< Updated upstream
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Update order status
  return NextResponse.json({ message: `Order ${id} updated` });
}
=======
// GET Order AVEC DÉTAIL TVA
export const GET = withApiLogger(async (
  _req: NextRequest,
  context: any 
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non autorisé", 401);
    
    const params = await context.params;
    const id = params.id;

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
    
    // Vérification : ADMIN ou Propriétaire de la commande
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération commande: ${message}`, 500);
  }
});

// PATCH Order (Admin only)
export const PATCH = withApiLogger(async (
  req: NextRequest,
  context: any
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const params = await context.params;
    const id = params.id;

    const body = await req.json();
    const validatedData = updateOrderSchema.parse(body);

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) return loggedErrorResponse("Commande non trouvée", 404);

    const updateData: Prisma.OrderUpdateInput = { ...validatedData };

    // Logique d'historique de statut
    if (validatedData.status && validatedData.status !== existingOrder.status) {
      await prisma.orderStatusHistory.create({
        data: { 
          orderId: id, 
          status: validatedData.status, 
          changedBy: session.user.id 
        },
      });
    }

    // Gestion automatique de la date de paiement
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
  } catch (error: unknown) {
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

// DELETE Order (Admin only)
export const DELETE = withApiLogger(async (
  _req: NextRequest,
  context: any
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const params = await context.params;
    const id = params.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return loggedErrorResponse("Commande non trouvée", 404);
    
    // Protection contre l'annulation de commandes déjà traitées
    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
      return loggedErrorResponse("Impossible d'annuler une commande livrée ou expédiée", 400);
    }

    await prisma.$transaction([
      prisma.orderStatusHistory.create({
        data: { 
          orderId: id, 
          status: "CANCELLED", 
          changedBy: session.user.id 
        },
      }),
      prisma.order.update({ where: { id }, data: { status: "CANCELLED" } }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
    ]);

    return loggedSuccessResponse({ message: "Commande annulée avec succès" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur annulation commande: ${message}`, 500);
  }
});
>>>>>>> Stashed changes
