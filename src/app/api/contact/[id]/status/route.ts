import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import {
  loggedErrorResponse,
  loggedSuccessResponse,
} from '@/lib/logger/exports';
import { apiLogger } from '@/lib/logger/sections';

const statusSchema = z.object({
  read: z.boolean(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      apiLogger.error('Unauthorized access to PUT contact status', {
        hasSession: !!session,
        userRole: session?.user?.role
      });
      return loggedErrorResponse('Non autorisé', 403);
    }

    const body = await req.json();
    const { read } = statusSchema.parse(body);

    apiLogger.info('Updating contact message status', { 
      messageId: id, 
      read 
    });

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });

    apiLogger.info('Contact message status updated successfully', { 
      messageId: id 
    });

    return loggedSuccessResponse(
      message,
      'Statut du message mis à jour'
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      apiLogger.error('Validation error in PUT contact status', { 
        errors: error.issues 
      });
      return loggedErrorResponse('Données invalides', 400, {
        details: error.issues,
      });
    }

    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error('PUT Contact status error', { error: message });
    return loggedErrorResponse(
      'Erreur lors de la mise à jour du statut',
      500
    );
  }
}