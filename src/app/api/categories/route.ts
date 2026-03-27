import { NextRequest, NextResponse } from "next/server";
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

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  active: z.boolean().default(true),
  parentId: z.string().optional().nullable(),
});

const CACHE_KEY = "categories:all";

export const GET = withApiLogger(async () => {
  try {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return loggedSuccessResponse({ categories: JSON.parse(cached) });
      }
    } catch {
      // Redis silencieux si erreur
    }

    const categories = await prisma.category.findMany({
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
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    try {
      await redis.set(CACHE_KEY, JSON.stringify(categories), "EX", 3600);
    } catch {
      // Cache skip
    }

    return loggedSuccessResponse({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur base de données";
    return loggedErrorResponse(`Erreur catégories: ${message}`, 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        image: validatedData.image,
        active: validatedData.active,
        parentId: validatedData.parentId,
      }
    });

    try {
      await redis.del(CACHE_KEY);
    } catch {
      // Cache skip
    }
    
    return loggedSuccessResponse({ category }, "Catégorie créée", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(error.issues[0].message, 400);
    }
    return loggedErrorResponse("Erreur lors de la création", 500);
  }
});