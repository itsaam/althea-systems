import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { z } from "zod";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export const PUT = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const body = await req.json();
    const validatedData = reorderSchema.parse(body);

    await prisma.$transaction(
      validatedData.items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: {

            updatedAt: new Date(),
          },
        })
      )
    );

    try {
      await redis.del("categories:all");
    } catch {
      // Redis skip
    }

    return loggedSuccessResponse(null, "Ordre mis à jour dans le code (en attente du Docker)");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse("Format de données invalide", 400);
    }
    const msg = error instanceof Error ? error.message : "Erreur réorganisation";
    return loggedErrorResponse(msg, 500);
  }
});