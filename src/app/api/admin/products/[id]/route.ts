import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productLogger, apiLogger, LogMessages } from "@/lib/logger/exports";

// GET /api/admin/products/[id] - Récupérer un produit par ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    apiLogger.http(LogMessages.api.requeteRecue("GET", "/api/admin/products/[id]"));

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

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      productLogger.warn(`Produit non trouvé : ${id}`);
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Sérialisation
    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    productLogger.info(`Produit récupéré : ${product.name} (${id})`);
    return NextResponse.json({ product: serializedProduct });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur récupération produit : ${message}`);
    return NextResponse.json(
      { error: `Erreur lors de la récupération du produit : ${message}` },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Modifier un produit
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    apiLogger.http(LogMessages.api.requeteRecue("PUT", "/api/admin/products/[id]"));

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

    const { id } = await context.params;
    const body = await req.json();

    // Vérification existence du produit
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      productLogger.warn(`Produit non trouvé pour modification : ${id}`);
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Validation avec le schéma API
    const { productApiSchema } = await import("@/lib/validators/product");
    const validatedData = productApiSchema.parse(body);

    // Vérification unicité du slug (sauf si c'est le même)
    if (validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Un produit avec ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Vérification unicité du SKU (sauf si c'est le même)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "Un produit avec ce SKU existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mise à jour du produit
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
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

    productLogger.info(`Produit modifié : ${product.name} (${product.id})`);

    return NextResponse.json({ product: serializedProduct });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur modification produit : ${message}`);
    return NextResponse.json(
      { error: `Erreur lors de la modification du produit : ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Supprimer un produit
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    apiLogger.http(LogMessages.api.requeteRecue("DELETE", "/api/admin/products/[id]"));

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

    const { id } = await context.params;

    // Vérification existence du produit
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      productLogger.warn(`Produit non trouvé pour suppression : ${id}`);
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Vérification que le produit n'est pas dans des commandes
    const ordersCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer ce produit car il est associé à des commandes. Vous pouvez le mettre en brouillon.",
        },
        { status: 400 }
      );
    }

    // Suppression du produit
    await prisma.product.delete({
      where: { id },
    });

    // TODO: Supprimer les images de R2 si nécessaire
    // Pour l'instant on les laisse, elles peuvent être réutilisées

    productLogger.info(`Produit supprimé : ${existingProduct.name} (${id})`);

    return NextResponse.json({ success: true, message: "Produit supprimé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur suppression produit : ${message}`);
    return NextResponse.json(
      { error: `Erreur lors de la suppression du produit : ${message}` },
      { status: 500 }
    );
  }
}
