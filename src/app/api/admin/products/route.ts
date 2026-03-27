import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";
import { productLogger, apiLogger, LogMessages } from "@/lib/logger/exports";

import type { ProductsResponse, ProductWithCategory } from "@/types/admin-table";

// Schéma de validation pour les query params
export const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  categoryIds: z.string().optional(), // Comma-separated IDs
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification authentification admin
    const session = await getServerSession(authOptions);
    if (!session) {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupération et validation des query params
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validatedParams = querySchema.parse(searchParams);

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      categoryIds,
      minPrice,
      maxPrice,
      inStock,
      status,
      startDate,
      endDate,
    } = validatedParams;

    // Construction des filtres Prisma
    const where: Prisma.ProductWhereInput = {};

    // Filtre recherche (nom, description, slug)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtre catégories
    if (categoryIds) {
      const ids = categoryIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        where.categoryId = { in: ids };
      }
    }

    // Filtre prix
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Filtre stock
    if (inStock !== undefined) {
      where.stock = inStock === "true" ? { gt: 0 } : { equals: 0 };
    }

    // Filtre statut
    if (status) {
      where.status = status;
    }

    // Filtre dates
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Construction du tri
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy) {
      // Gestion spéciale pour le prix TTC (calculé côté client, on trie par prix HT)
      if (sortBy === "priceTTC") {
        orderBy.price = sortOrder || "asc";
      } else {
        orderBy[sortBy as keyof Prisma.ProductOrderByWithRelationInput] = sortOrder || "asc";
      }
    } else {
      // Tri par défaut : date de création décroissante
      orderBy.createdAt = "desc";
    }

    // Calcul pagination
    const skip = (page - 1) * limit;

    // Requête avec count pour pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Sérialisation des Decimals en numbers et Dates en strings
    const serializedProducts: ProductWithCategory[] = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    const response: ProductsResponse = {
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    productLogger.info(`Liste produits récupérée : ${products.length}/${total} produits (page ${page}/${totalPages})`);

    return loggedSuccessResponse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return loggedErrorResponse("Paramètres invalides", 400);
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur récupération produits admin : ${message}`);
    return loggedErrorResponse(`Erreur lors de la récupération des produits : ${message}`, 500);
  }
});

// POST /api/admin/products - Créer un nouveau produit
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification authentification admin
    const session = await getServerSession(authOptions);
    if (!session) {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validation avec le schéma API
    const { productApiSchema } = await import("@/lib/validators/product");
    const validatedData = productApiSchema.parse(body);

    // Génération automatique du slug si vide
    let slug = validatedData.slug;
    if (!slug || slug.trim() === "") {
      slug = validatedData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Vérification unicité du slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return loggedErrorResponse("Un produit avec ce slug existe déjà", 400);
    }

    // Vérification unicité du SKU si fourni
    if (validatedData.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
      });

      if (existingSku) {
        return loggedErrorResponse("Un produit avec ce SKU existe déjà", 400);
      }
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice,
        tva: validatedData.tva,
        sku: validatedData.sku,
        stock: validatedData.stock,
        priority: validatedData.priority,
        images: validatedData.images,
        featured: validatedData.featured,
        status: validatedData.status,
        categoryId: validatedData.categoryId,
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

    // Sérialisation
    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    productLogger.info(`Produit créé : ${product.name} (${product.id})`);

    return loggedSuccessResponse(
      { product: serializedProduct },
      `Produit créé : ${product.name}`,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return loggedErrorResponse("Données invalides", 400);
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur création produit : ${message}`);
    return loggedErrorResponse(`Erreur lors de la création du produit : ${message}`, 500);
  }
});

