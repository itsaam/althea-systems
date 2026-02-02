import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";
import {
  calculateCartTotals,
  type CartItem,
} from "@/lib/tva-utils";
import {
  getCartFromCookie,
  saveCartToCookie,
} from "@/lib/cart-cookie";

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0),
});

// GET - Récupérer le panier avec calculs TVA
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    //  Récupération depuis les cookies
    const cartCookieItems = await getCartFromCookie();

    if (cartCookieItems.length === 0) {
      return loggedSuccessResponse({
        cart: {
          items: [],
          subtotalHT: 0,
          totalTVA: 0,
          totalTTC: 0,
          tvaBreakdown: [],
        },
      });
    }

    // Récupérer les infos produits depuis la BDD
    const productIds = cartCookieItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        tva: true,
        images: true,
        stock: true,
        status: true,
      },
    });

    // Construire les items du panier avec type guard
    const cartItems = cartCookieItems
      .map((cookieItem) => {
        const product = products.find((p) => p.id === cookieItem.productId);
        if (!product || product.status !== "PUBLISHED") return null;

        return {
          productId: product.id,
          product,
          quantity: Math.min(cookieItem.quantity, product.stock),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Calcul des totaux avec TVA
    const cartItemsForCalc: CartItem[] = cartItems.map((item) => ({
      priceHT: Number(item.product.price),
      tvaRate: item.product.tva,
      quantity: item.quantity,
    }));

    const totals = calculateCartTotals(cartItemsForCalc);

    const serializedCart = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          tva: item.product.tva,
          images: item.product.images,
          stock: item.product.stock,
        },
        quantity: item.quantity,
      })),
      subtotalHT: totals.subtotalHT,
      totalTVA: totals.totalTVA,
      totalTTC: totals.totalTTC,
      tvaBreakdown: totals.tvaBreakdown,
    };

    return loggedSuccessResponse({ cart: serializedCart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`GET cart error: ${message}`);
    return loggedErrorResponse(`Erreur récupération panier: ${message}`, 500);
  }
});

// POST - Ajouter un produit au panier
export const POST = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const body = await req.json();
    const validatedData = addToCartSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: { id: true, status: true, stock: true },
    });

    if (!product) {
      return loggedErrorResponse("Produit non trouvé", 404);
    }

    if (product.status !== "PUBLISHED") {
      return loggedErrorResponse("Produit non disponible", 400);
    }

    //  Récupération du panier
    const cart = await getCartFromCookie();
    const existingItem = cart.find((item) => item.productId === validatedData.productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + validatedData.quantity;
      if (newQuantity > product.stock) {
        return loggedErrorResponse(`Stock insuffisant. Disponible: ${product.stock}`, 400);
      }
      existingItem.quantity = newQuantity;
    } else {
      if (validatedData.quantity > product.stock) {
        return loggedErrorResponse(`Stock insuffisant. Disponible: ${product.stock}`, 400);
      }
      cart.push({
        productId: validatedData.productId,
        quantity: validatedData.quantity,
      });
    }

    //  Sauvegarde
    await saveCartToCookie(cart);

    apiLogger.info(`Produit ${validatedData.productId} ajouté (qty: ${validatedData.quantity})`);
    return loggedSuccessResponse({ message: "Produit ajouté au panier" }, "Produit ajouté", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur ajout panier: ${message}`, 500);
  }
});

// PUT - Mettre à jour la quantité
export const PUT = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const body = await req.json();
    const validatedData = updateCartItemSchema.parse(body);

    const cart = await getCartFromCookie();
    const itemIndex = cart.findIndex((item) => item.productId === validatedData.productId);

    if (itemIndex === -1) {
      return loggedErrorResponse("Produit non trouvé dans le panier", 404);
    }

    if (validatedData.quantity === 0) {
      // Supprimer l'article
      cart.splice(itemIndex, 1);
    } else {
      // Vérifier le stock
      const product = await prisma.product.findUnique({
        where: { id: validatedData.productId },
        select: { stock: true },
      });

      if (!product) {
        return loggedErrorResponse("Produit non trouvé", 404);
      }

      if (product.stock < validatedData.quantity) {
        return loggedErrorResponse(`Stock insuffisant. Disponible: ${product.stock}`, 400);
      }

      cart[itemIndex].quantity = validatedData.quantity;
    }

    await saveCartToCookie(cart);

    apiLogger.info(`Panier mis à jour - ${validatedData.productId} (qty: ${validatedData.quantity})`);
    return loggedSuccessResponse({ message: "Panier mis à jour" }, "Panier mis à jour");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour panier: ${message}`, 500);
  }
});

// DELETE - Supprimer un article
export const DELETE = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return loggedErrorResponse("Non authentifié", 401);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return loggedErrorResponse("ID produit manquant", 400);
    }

    const cart = await getCartFromCookie();
    const filteredCart = cart.filter((item) => item.productId !== productId);

    await saveCartToCookie(filteredCart);

    apiLogger.info(`Produit ${productId} retiré du panier`);
    return loggedSuccessResponse({ message: "Produit retiré" }, "Produit retiré");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur suppression: ${message}`, 500);
  }
});