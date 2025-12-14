import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  productLogger,
  apiLogger,
  LogMessages,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

// GET /api/products - Récupérer tous les produits
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // TODO: Implémenter la récupération des produits depuis Prisma
    const products: unknown[] = [];

    productLogger.info(`${products.length} produits récupérés`);
    return loggedSuccessResponse({ products }, `Liste des produits récupérée`);
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
    const { name, price, description, categoryId } = body;

    // Validation basique
    if (!name || !price) {
      apiLogger.warn(LogMessages.api.erreurValidation("name, price requis"));
      return loggedErrorResponse("Nom et prix requis", 400);
    }

    // TODO: Implémenter la création du produit avec Prisma
    const productId = "PROD-" + Date.now();

    productLogger.info(LogMessages.product.produitCree(productId, name), {
      price,
      categoryId,
    });

    return loggedSuccessResponse(
      { id: productId, name, price, description, categoryId },
      LogMessages.product.produitCree(productId, name),
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur création produit: ${message}`, 500);
  }
});
