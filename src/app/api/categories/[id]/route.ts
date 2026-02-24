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

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  active: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
});

/**
 * Interface pour typer proprement le contexte sans utiliser 'any'
 * pour satisfaire à la fois ESLint et Next.js 15.
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const { id } = await (context as RouteParams).params;
    const cacheKey = `category:${id}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return loggedSuccessResponse({ category: JSON.parse(cached) });
    } catch {
      // Redis skip
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true
          }
        }
      }
    });

    if (!category) return loggedErrorResponse("Catégorie non trouvée", 404);

    try {
      await redis.set(cacheKey, JSON.stringify(category), "EX", 3600);
    } catch {
      // Cache skip
    }

    return loggedSuccessResponse({ category });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    return loggedErrorResponse(msg, 500);
  }
});

export const PUT = withApiLogger(async (req: NextRequest, context: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as RouteParams).params;
    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: validatedData
    });

    try {
      await redis.del("categories:all");
      await redis.del(`category:${id}`);
    } catch {
      // Cache skip
    }

    return loggedSuccessResponse({ category }, "Mise à jour réussie");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur modification";
    return loggedErrorResponse(msg, 500);
  }
});

export const DELETE = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = await (context as RouteParams).params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } }
    });

    if (!category) return loggedErrorResponse("Catégorie non trouvée", 404);
    if (category._count.products > 0 || category._count.children > 0) {
      return loggedErrorResponse("Catégorie non vide", 400);
    }

    await prisma.category.delete({ where: { id } });

    try {
      await redis.del("categories:all");
      await redis.del(`category:${id}`);
    } catch {
      // Cache skip
    }

    return loggedSuccessResponse(null, "Supprimé");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur suppression";
    return loggedErrorResponse(msg, 500);
  }
});