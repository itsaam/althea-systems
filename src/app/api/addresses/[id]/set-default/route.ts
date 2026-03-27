import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST - Définir comme adresse par défaut
export const POST = withApiLogger(async (
  _req: NextRequest,
  context: unknown
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

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: address.userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    apiLogger.info(`Adresse ${id} définie par défaut pour user ${session.user.id}`);
    return loggedSuccessResponse(
      { message: 'Adresse définie par défaut avec succès' },
      "Adresse par défaut mise à jour"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`POST address default error: ${message}`);
    return loggedErrorResponse(`Erreur mise à jour adresse par défaut: ${message}`, 500);
  }
});