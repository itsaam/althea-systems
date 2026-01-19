import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  productLogger,
  apiLogger,
  LogMessages,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

// GET /api/products - Récupérer tous les produits
export const GET = withApiLogger(async (_req: NextRequest) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedProducts = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    }));

    productLogger.info(`${serializedProducts.length} produits récupérés`);
    return loggedSuccessResponse(
      { products: serializedProducts },
      `Liste des produits récupérée`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération produits: ${message}`, 500);
  }
});

// POST /api/products - Créer un produit (admin only)
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, price, stock, description, categoryId, image } = body;

    if (!name || !slug) {
      apiLogger.warn(LogMessages.api.erreurValidation("name, slug requis"));
      return loggedErrorResponse("Nom et slug requis", 400);
    }

    if (!price || price <= 0) {
      apiLogger.warn(LogMessages.api.erreurValidation("prix invalide"));
      return loggedErrorResponse("Prix invalide", 400);
    }

    if (!categoryId) {
      apiLogger.warn(LogMessages.api.erreurValidation("categoryId requis"));
      return loggedErrorResponse("Catégorie requise", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      apiLogger.warn(`Slug déjà utilisé: ${slug}`);
      return loggedErrorResponse("Ce slug est déjà utilisé", 400);
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        stock: stock || 0,
        images: image ? [image] : [],
        categoryId,
        active: true,
        featured: false,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    };

    productLogger.info(LogMessages.product.produitCree(product.id, name), {
      price,
      categoryId,
      stock,
    });

    return loggedSuccessResponse(
      { product: serializedProduct },
      LogMessages.product.produitCree(product.id, name),
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur création produit: ${message}`);
    return loggedErrorResponse(`Erreur création produit: ${message}`, 500);
  }
});
