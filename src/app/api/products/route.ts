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
import { ZodError } from "zod";
import { productSchema } from "@/lib/validators/product";

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

    // Validation avec Zod
    let validatedData;
    try {
      // Adapter les données au schéma Zod (convertir image → images)
      const dataForValidation = {
        ...body,
        images: body.image ? [body.image] : body.images || [],
        stock: body.stock ?? 0,
      };
      validatedData = productSchema.parse(dataForValidation);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        const message = `${firstError.path.join(".")}: ${firstError.message}`;
        apiLogger.warn(LogMessages.api.erreurValidation(message));
        return loggedErrorResponse(message, 400);
      }
      throw error;
    }

    const { name, slug, price, stock, description, categoryId, images } =
      validatedData;

    // Vérifier l'unicité du slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug: slug || "" },
    });

    if (existingProduct) {
      apiLogger.warn(`Slug déjà utilisé: ${slug}`);
      return loggedErrorResponse("Ce slug est déjà utilisé", 400);
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || "",
        description: description || null,
        price,
        stock: stock || 0,
        images: images || [],
        categoryId,
        status: "PUBLISHED",
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
