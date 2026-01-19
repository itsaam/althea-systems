import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  apiLogger,
} from '@/lib/logger/exports';

// GET Récupérer un utilisateur avec adresses et commandes
export const GET = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return loggedErrorResponse('Utilisateur non trouvé', 404);
    }

    // Exclure le password
    const { password: _password, ...userWithoutPassword } = user;

    const ordersFormatted = userWithoutPassword.orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
    }));

    return loggedSuccessResponse({
      ...userWithoutPassword,
      orders: ordersFormatted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`GET user error: ${message}`, {
      stack: error instanceof Error ? error.stack : undefined,
    });
    return loggedErrorResponse('Erreur lors de la récupération de l\'utilisateur', 500);
  }
});

// PATCH Mettre à jour un utilisateur
export const PATCH = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    const body = await req.json();

    type AllowedFields = Partial<Pick<Prisma.UserUpdateInput, 'firstName' | 'lastName' | 'phone' | 'password'>>;
    const updateData: AllowedFields = {};

    ['firstName', 'lastName', 'phone'].forEach(field => {
      if (field in body) updateData[field as keyof AllowedFields] = body[field];
    });

    if (body.password) {
      const { hash } = await import('bcryptjs');
      updateData.password = await hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return loggedSuccessResponse(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`PATCH user error: ${message}`, {
      stack: error instanceof Error ? error.stack : undefined,
    });
    return loggedErrorResponse('Erreur lors de la mise à jour de l\'utilisateur', 500);
  }
});

// DELETE Supprimer un utilisateur si pas de commandes/adresses
export const DELETE = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: { select: { id: true } },
        addresses: { select: { id: true } },
      },
    });

    if (!user) {
      return loggedErrorResponse('Utilisateur non trouvé', 404);
    }

    if (user.orders.length > 0 || user.addresses.length > 0) {
      return loggedErrorResponse(
        'Impossible de supprimer l’utilisateur : il possède des commandes ou des adresses associées',
        400
      );
    }

    await prisma.user.delete({ where: { id } });

    return loggedSuccessResponse({ message: 'Utilisateur supprimé avec succès' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`DELETE user error: ${message}`, {
      stack: error instanceof Error ? error.stack : undefined,
    });
    return loggedErrorResponse('Erreur lors de la suppression de l’utilisateur', 500);
  }
});
