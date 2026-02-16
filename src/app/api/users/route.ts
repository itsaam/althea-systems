import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  apiLogger,
} from '@/lib/logger/exports';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  // role ignoré côté client
});

// ================= GET /users =================
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return loggedSuccessResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`GET users error: ${message}`, { stack: error instanceof Error ? error.stack : undefined });
    return loggedErrorResponse('Erreur lors de la récupération des utilisateurs', 500);
  }
});

//Crer User
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validatedData = userSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return loggedErrorResponse('Cet email est déjà utilisé', 400);
    }

    const hashedPassword = validatedData.password
      ? await hash(validatedData.password, 12)
      : null;

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        role: 'USER', 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return loggedSuccessResponse(user, 'Utilisateur créé avec succès', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse('Données invalides', 400, { details: error.issues });
    }
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`POST user error: ${message}`, { stack: error instanceof Error ? error.stack : undefined });
    return loggedErrorResponse('Erreur lors de la création de l\'utilisateur', 500);
  }
});
