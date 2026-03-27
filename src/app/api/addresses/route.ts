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

const addressSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  street: z.string().min(1, "Rue requise"),
  street2: z.string().optional(),
  city: z.string().min(1, "Ville requise"),
  region: z.string().optional(),
  postalCode: z.string().min(1, "Code postal requis"),
  country: z.string().min(1, "Pays requis"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions); 
    if (!session) return loggedErrorResponse("Non authentifié", 401);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const targetUserId = session.user.role === "ADMIN" && userId
      ? userId
      : session.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId: targetUserId },
      orderBy: [{ isDefault: 'desc' }],
    });

    return loggedSuccessResponse({ addresses }); 
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`GET addresses error: ${message}`);
    return loggedErrorResponse(`Erreur récupération adresses: ${message}`, 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non authentifié", 401);

    const body = await req.json();
    const validatedData = addressSchema.parse(body); 

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: session.user.id, 
      },
    });

    apiLogger.info(`Adresse créée pour user ${session.user.id}`);
    return loggedSuccessResponse({ address }, "Adresse créée avec succès", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map(i => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`POST address error: ${message}`);
    return loggedErrorResponse(`Erreur création adresse: ${message}`, 500);
  }
});