import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

// GET Détails d'une adresse
export const GET = withApiLogger(async (
  req: NextRequest,
  context: any
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const params = await context.params;
    const { id } = params;

    const address = await prisma.address.findUnique({
      where: { id },
      include: {
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

    if (!address) {
      return loggedErrorResponse('Adresse non trouvée', 404);
    }

    if (session.user.role !== "ADMIN" && session.user.id !== address.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

    return loggedSuccessResponse(address);
  } catch (error: any) {
    console.error("[Address GET] Erreur:", error);
    return loggedErrorResponse(`Erreur récupération adresse : ${error.message}`, 500);
  }
});

// PATCH Mise à jour d'une adresse
export const PATCH = withApiLogger(async (
  req: NextRequest,
  context: any
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const currentAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!currentAddress) {
      return loggedErrorResponse('Adresse non trouvée', 404);
    }

    if (session.user.id !== currentAddress.userId && session.user.role !== "ADMIN") {
      return loggedErrorResponse("Accès interdit", 403);
    }

    if (body.isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: currentAddress.userId,
          id: { not: id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: body,
    });

    return loggedSuccessResponse(updatedAddress, "Adresse mise à jour avec succès");
  } catch (error: any) {
    console.error("[Address PATCH] Erreur:", error);
    return loggedErrorResponse(`Erreur mise à jour adresse : ${error.message}`, 500);
  }
});

// DELETE Supprimer une adresse
export const DELETE = withApiLogger(async (
  req: NextRequest,
  context: any
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const params = await context.params;
    const { id } = params;

    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return loggedErrorResponse('Adresse non trouvée', 404);
    }

    if (session.user.id !== address.userId && session.user.role !== "ADMIN") {
      return loggedErrorResponse("Accès interdit", 403);
    }

    const ordersCount = await prisma.order.count({
      where: { addressId: id },
    });

    if (ordersCount > 0) {
      return loggedErrorResponse(
        'Impossible de supprimer une adresse utilisée dans des commandes passées. L\'historique doit être préservé.',
        400
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return loggedSuccessResponse({ message: 'Adresse supprimée avec succès' });
  } catch (error: any) {
    console.error("[Address DELETE] Erreur:", error);
    return loggedErrorResponse(`Erreur suppression adresse : ${error.message}`, 500);
  }
});
