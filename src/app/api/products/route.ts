import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withApiLogger, loggedErrorResponse, loggedSuccessResponse, productLogger, LogMessages } from "@/lib/logger/exports";
import { Prisma } from "@prisma/client";

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

const updateProductSchema = productSchema.partial();

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const where: Prisma.ProductWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.featured = true;

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    const serializedProducts = products.map(p => ({
      ...p,
      price: p.price.toNumber(),
      comparePrice: p.comparePrice?.toNumber() || null,
      image: p.images[0] || null,
    }));

    productLogger.info(`${serializedProducts.length} produits récupérés`);
    return loggedSuccessResponse({ products: serializedProducts }, "Liste des produits récupérée");
  } catch (error) {
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

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
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    };

    productLogger.info(LogMessages.product.produitCree(product.id, product.name));
    return loggedSuccessResponse({ product: serializedProduct }, LogMessages.product.produitCree(product.id, product.name), 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(`Données invalides: ${error.issues.map(i => i.message).join(", ")}`, 400);
    }
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
});

export const PATCH = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const id = new URL(req.url).pathname.split("/").pop();
    if (!id) return loggedErrorResponse("ID produit manquant", 400);

    const body = await req.json();
    const validatedData = updateProductSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return loggedErrorResponse("Produit non trouvé", 404);

    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: validatedData.categoryId } });
      if (!category) return loggedErrorResponse("Catégorie non trouvée", 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    const serializedProduct = {
      ...updatedProduct,
      price: updatedProduct.price.toNumber(),
      comparePrice: updatedProduct.comparePrice?.toNumber() || null,
      image: updatedProduct.images[0] || null,
    };

    productLogger.info(LogMessages.product.produitModifie(updatedProduct.id));
    return loggedSuccessResponse({ product: serializedProduct }, "Produit mis à jour");
  } catch (error) {
    if (error instanceof z.ZodError) return loggedErrorResponse(`Données invalides: ${error.issues.map(i => i.message).join(", ")}`, 400);
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
});

export const DELETE = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const id = new URL(req.url).pathname.split("/").pop();
    if (!id) return loggedErrorResponse("ID produit manquant", 400);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return loggedErrorResponse("Produit non trouvé", 404);

    await prisma.product.delete({ where: { id } });
    productLogger.info(LogMessages.product.produitSupprime(existingProduct.id));

    return loggedSuccessResponse({ message: "Produit supprimé" }, "Produit supprimé");
  } catch (error) {
    return loggedErrorResponse(error instanceof Error ? error.message : "Erreur inconnue", 500);
  }
});
