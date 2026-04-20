import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZodError, z } from "zod";
import { Prisma } from "@prisma/client";
import {
  productLogger,
  LogMessages,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import { getPriceBreakdown } from "@/lib/tva-utils";

export const dynamic = 'force-dynamic';

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Le prix doit être positif"),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1, "La catégorie est requise").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]).default("TVA_20"),
  priority: z.number().int().default(0),
});

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.featured = true;

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        featured: true,
        createdAt: true,
        categoryId: true,
        tva: true, 
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedProducts = products.map((product) => {
      const priceHT = typeof product.price === 'object' ? Number(product.price) : product.price;
      const breakdown = getPriceBreakdown(priceHT, product.tva); 
      return {
        ...product,
        price: priceHT,
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        priceTTC: breakdown.priceTTC,
        priceBreakdown: breakdown,
        image: product.images?.[0] || null,
      };
    });

    productLogger.info(`${serializedProducts.length} produits récupérés`);
    return loggedSuccessResponse({ products: serializedProducts }, "Liste des produits récupérée");
  } catch (error) {
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({ where: { slug: validatedData.slug } });
    if (existingProduct) return loggedErrorResponse("Ce slug est déjà utilisé", 400);

    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: validatedData.categoryId } });
      if (!category) return loggedErrorResponse("Catégorie non trouvée", 404);
    }

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const priceHT = Number(product.price);
    const breakdown = getPriceBreakdown(priceHT, product.tva); 

    const serializedProduct = {
      ...product,
      price: priceHT,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      priceTTC: breakdown.priceTTC,
      priceBreakdown: breakdown,
      image: product.images[0] || null,
    };

    productLogger.info(LogMessages.product.produitCree(product.id, product.name));

    return loggedSuccessResponse(
      { product: serializedProduct },
      LogMessages.product.produitCree(product.id, product.name),
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return loggedErrorResponse(`Données invalides: ${error.issues.map(i => i.message).join(", ")}`, 400);
    }
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur création produit", 500);
  }
});


