import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

export const GET = withApiLogger(async (
  _req: NextRequest,
  context: unknown
) => {
  try {
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        parent: true,
        children: true,
      },
    });

    if (!category) {
      return loggedErrorResponse("Catégorie non trouvée", 404);
    }

    return loggedSuccessResponse({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Categories GET by ID] Erreur:", error);
    return loggedErrorResponse(
      `Erreur lors de la récupération de la catégorie: ${message}`,
      500
    );
  }
});

export const PUT = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé. Accès admin requis.", 401);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    
    const body = await req.json();
    const { name, slug, description, image } = body;

    if (!name || !name.trim()) {
      return loggedErrorResponse("Le nom de la catégorie est requis", 400);
    }

    if (!slug || !slug.trim()) {
      return loggedErrorResponse("Le slug est requis", 400);
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return loggedErrorResponse("Catégorie non trouvée", 404);
    }

    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return loggedErrorResponse("Ce slug existe déjà. Veuillez en choisir un autre.", 400);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || "",
        image: image || "",
      },
    });

    console.log(`[Categories PUT] Catégorie mise à jour: ${category.id} - ${category.name}`);

    return loggedSuccessResponse(
      { category },
      "Catégorie mise à jour avec succès"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Categories PUT] Erreur:", error);
    return loggedErrorResponse(
      `Erreur lors de la mise à jour de la catégorie: ${message}`,
      500
    );
  }
});

export const DELETE = withApiLogger(async (
  _req: NextRequest,
  context: unknown
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé. Accès admin requis.", 401);
    }

    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return loggedErrorResponse("Catégorie non trouvée", 404);
    }

    if (category._count.products > 0) {
      return loggedErrorResponse(
        `Impossible de supprimer cette catégorie car elle contient ${category._count.products} produit(s).`,
        400
      );
    }

    if (category.image) {
      try {
        await deleteFromR2(category.image);
      } catch (error) {
        console.warn("[Categories DELETE] Impossible de supprimer l'image R2:", error);
      }
    }

    await prisma.category.delete({
      where: { id },
    });

    console.log(`[Categories DELETE] Catégorie supprimée: ${id} - ${category.name}`);

    return loggedSuccessResponse({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Categories DELETE] Erreur:", error);
    return loggedErrorResponse(
      `Erreur lors de la suppression de la catégorie: ${message}`,
      500
    );
  }
});