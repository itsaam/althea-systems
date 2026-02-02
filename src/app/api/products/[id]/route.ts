import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
<<<<<<< Updated upstream

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
=======
import { z } from "zod";
import {
  productLogger,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";
import {
  calculateTTC,
  getPriceBreakdown,
} from "@/lib/tva-utils";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  tva: z.enum(["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"]).optional(),
  priority: z.number().int().optional(),
  categoryId: z.string().nullable().optional(),
});

// GET - AVEC PRIX TTC
export const GET = withApiLogger(
  async (req: NextRequest, context: any) => {
    try {
      // --- LA CORRECTION EST ICI ---
      const params = await context.params; // On attend la Promise
      const id = params.id;               // On extrait l'ID après le await
      // -----------------------------

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
>>>>>>> Stashed changes
          },
        },
      },
    });

<<<<<<< Updated upstream
    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
=======
      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      const priceHT = product.price.toNumber();
      const priceBreakdown = getPriceBreakdown(priceHT, product.tva);
      
      const comparePriceHT = product.comparePrice?.toNumber();
      const comparePriceTTC = comparePriceHT 
        ? calculateTTC(comparePriceHT, product.tva)
        : null;

      return loggedSuccessResponse({
        product: {
          ...product,
          price: priceHT,                             
          comparePrice: comparePriceHT ?? null,        
          priceBreakdown: {                             
            priceHT: priceBreakdown.priceHT,
            priceTTC: priceBreakdown.priceTTC,
            tvaAmount: priceBreakdown.tvaAmount,
            tvaRate: priceBreakdown.tvaRate,
            tvaLabel: priceBreakdown.tvaLabel,
          },
          comparePriceTTC,                             
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur récupération produit: ${message}`,
        500
>>>>>>> Stashed changes
      );
    }

    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    };

    return NextResponse.json({ product: serializedProduct });
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

<<<<<<< Updated upstream
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
=======
// PATCH Admin 
export const PATCH = withApiLogger(
  async (req: NextRequest, context: any) => {
    try {
      // --- LA CORRECTION EST ICI ---
      const params = await context.params;
      const id = params.id;
      // -----------------------------

      const session = await getServerSession(authOptions);
>>>>>>> Stashed changes

    const { id } = await params;
    const body = await request.json();
    const { name, slug, price, stock, description, categoryId, image } = body;

<<<<<<< Updated upstream
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Nom et slug requis" },
        { status: 400 }
=======
      const body = await req.json();
      const validatedData = updateProductSchema.parse(body);

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (
        validatedData.slug &&
        validatedData.slug !== existingProduct.slug
      ) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: validatedData.slug },
        });

        if (slugExists) {
          return loggedErrorResponse("Ce slug est déjà utilisé", 400);
        }
      }

      if (validatedData.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: validatedData.categoryId },
        });

        if (!category) {
          return loggedErrorResponse("Catégorie non trouvée", 404);
        }
      }

      const product = await prisma.product.update({
        where: { id },
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

      productLogger.info(`Produit ${id} mis à jour`);

      const priceHT = product.price.toNumber();
      const priceBreakdown = getPriceBreakdown(priceHT, product.tva);
      
      const comparePriceHT = product.comparePrice?.toNumber();
      const comparePriceTTC = comparePriceHT 
        ? calculateTTC(comparePriceHT, product.tva)
        : null;

      return loggedSuccessResponse(
        {
          product: {
            ...product,
            price: priceHT,
            comparePrice: comparePriceHT ?? null,
            priceBreakdown: {
              priceHT: priceBreakdown.priceHT,
              priceTTC: priceBreakdown.priceTTC,
              tvaAmount: priceBreakdown.tvaAmount,
              tvaRate: priceBreakdown.tvaRate,
              tvaLabel: priceBreakdown.tvaLabel,
            },
            comparePriceTTC,
          },
        },
        "Produit mis à jour avec succès"
>>>>>>> Stashed changes
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Catégorie requise" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    if (slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Ce slug est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        price,
        stock: stock || 0,
        images: image ? [image] : [],
        categoryId,
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
      ...updatedProduct,
      price: updatedProduct.price.toNumber(),
      comparePrice: updatedProduct.comparePrice?.toNumber() || null,
      image: updatedProduct.images[0] || null,
    };

    return NextResponse.json({
      message: "Produit mis à jour avec succès",
      product: serializedProduct,
    });
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le produit
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}

<<<<<<< Updated upstream
=======
// DELETE Admin
export const DELETE = withApiLogger(
  async (req: NextRequest, context: any) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session || session.user?.role !== "ADMIN") {
        return loggedErrorResponse("Non autorisé", 403);
      }

      // --- LA CORRECTION EST ICI ---
      const params = await context.params;
      const id = params.id;
      // -----------------------------

      const product = await prisma.product.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (product.orderItems.length > 0) {
        return loggedErrorResponse(
          "Impossible de supprimer un produit ayant des commandes",
          400
        );
      }

      await prisma.product.delete({ where: { id } });

      productLogger.info(`Produit ${id} supprimé`);

      return loggedSuccessResponse(
        { message: "Produit supprimé avec succès" },
        "Produit supprimé"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return loggedErrorResponse(
        `Erreur suppression produit: ${message}`,
        500
      );
    }
  }
);
>>>>>>> Stashed changes
