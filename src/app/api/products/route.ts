import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
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

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]).default("TVA_20"),
  priority: z.number().int().default(0),
});

// GET Récupérer tous les produits
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.featured = true;
    if (active === "true") where.active = true;

    const products = await prisma.product.findMany({
      where,
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

// POST Créer un produit 
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Vérifier l'unicité du slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      apiLogger.warn(`Slug déjà utilisé: ${validatedData.slug}`);
      return loggedErrorResponse("Ce slug est déjà utilisé", 400);
    }

    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return loggedErrorResponse("Catégorie non trouvée", 404);
      }
    }

    const product = await prisma.product.create({
      data: validatedData,
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

    productLogger.info(
      LogMessages.product.produitCree(product.id, product.name),
      {
        price: validatedData.price,
        categoryId: validatedData.categoryId,
        stock: validatedData.stock,
      }
    );

    return loggedSuccessResponse(
      { product: serializedProduct },
      LogMessages.product.produitCree(product.id, product.name),
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur création produit: ${message}`);
    return loggedErrorResponse(`Erreur création produit: ${message}`, 500);
  }
});