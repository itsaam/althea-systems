import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

// POST Définir une adresse comme adresse par défaut
export const POST = withApiLogger(async (
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
    if (session.user.id !== address.userId) {
      return loggedErrorResponse("Accès interdit : vous n'êtes pas le propriétaire", 403);
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: address.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.address.update({
        where: { id },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return loggedSuccessResponse(
      { message: 'Adresse définie par défaut avec succès' }
    );
  } catch (error: any) {
    console.error("[Address Set Default] Erreur:", error);
    return loggedErrorResponse(
      `Erreur lors de la mise à jour de l'adresse : ${error.message}`, 
      500
    );
  }
});