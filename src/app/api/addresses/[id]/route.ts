import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

export const GET = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Address GET] Erreur:", error);
    return loggedErrorResponse(`Erreur récupération adresse : ${message}`, 500);
  }
});

export const PATCH = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Address PATCH] Erreur:", error);
    return loggedErrorResponse(`Erreur mise à jour adresse : ${message}`, 500);
  }
});

export const DELETE = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Address DELETE] Erreur:", error);
    return loggedErrorResponse(`Erreur suppression adresse : ${message}`, 500);
  }
});