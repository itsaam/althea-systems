import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";

const updateAddressSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  street2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  region: z.string().optional().nullable(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Détail d'une adresse
export const GET = withApiLogger(async (
  _req: NextRequest,
  context?: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non authentifié", 401);

    const { id } = await (context as RouteContext).params;

    const address = await prisma.address.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!address) return loggedErrorResponse('Adresse non trouvée', 404);

    if (session.user.role !== "ADMIN" && session.user.id !== address.userId) {
      return loggedErrorResponse("Accès interdit", 403);
    }

    return loggedSuccessResponse({ address });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération adresse: ${message}`, 500);
  }
});

// PATCH - Modifier une adresse
export const PATCH = withApiLogger(async (
  req: NextRequest,
  context?: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non authentifié", 401);

    const { id } = await (context as RouteContext).params;
    const body = await req.json();
    const validatedData = updateAddressSchema.parse(body); 

    const currentAddress = await prisma.address.findUnique({ where: { id } });
    if (!currentAddress) return loggedErrorResponse('Adresse non trouvée', 404);

    if (session.user.id !== currentAddress.userId && session.user.role !== "ADMIN") {
      return loggedErrorResponse("Accès interdit", 403);
    }

    if (validatedData.isDefault === true) {
      await prisma.address.updateMany({
        where: { userId: currentAddress.userId, id: { not: id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: validatedData,
    });

    apiLogger.info(`Adresse ${id} mise à jour par user ${session.user.id}`);
    return loggedSuccessResponse({ address: updatedAddress }, "Adresse mise à jour avec succès");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map(i => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour adresse: ${message}`, 500);
  }
});

// DELETE - Supprimer une adresse
export const DELETE = withApiLogger(async (
  _req: NextRequest,
  context?: unknown
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non authentifié", 401);

    const { id } = await (context as RouteContext).params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) return loggedErrorResponse('Adresse non trouvée', 404);

    if (session.user.id !== address.userId && session.user.role !== "ADMIN") {
      return loggedErrorResponse("Accès interdit", 403);
    }

    const ordersCount = await prisma.order.count({ where: { addressId: id } });
    if (ordersCount > 0) {
      return loggedErrorResponse(
        "Impossible de supprimer une adresse utilisée dans des commandes passées.",
        400
      );
    }

    await prisma.address.delete({ where: { id } });

    apiLogger.info(`Adresse ${id} supprimée par user ${session.user.id}`);
    return loggedSuccessResponse({ message: 'Adresse supprimée avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur suppression adresse: ${message}`, 500);
  }
});