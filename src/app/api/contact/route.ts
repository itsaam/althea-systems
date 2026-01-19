import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from '@/lib/logger/exports';
import { apiLogger } from '@/lib/logger/sections';

const contactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

// GET Liste des messages (Admin uniquement)
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { searchParams } = new URL(req.url);
    const read = searchParams.get('read');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (read === 'true') where.read = true;
    if (read === 'false') where.read = false;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return loggedSuccessResponse({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error('GET Contact messages error', { error: message });
    return loggedErrorResponse('Erreur lors de la récupération des messages', 500);
  }
});

// POST Créer un message de contact 
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: validatedData,
    });

    return loggedSuccessResponse(
      { data: message, success: true },
      'Votre message a été envoyé avec succès',
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        'Données invalides',
        400,
        { details: error.issues }
      );
    }

    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error('POST Contact error', { error: message });
    return loggedErrorResponse('Erreur lors de l\'envoi du message', 500);
  }
});
