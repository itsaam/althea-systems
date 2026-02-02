import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";
import { productLogger, apiLogger, LogMessages } from "@/lib/logger/exports";

import type { BulkActionData, BulkDeleteData } from "@/types/admin-table";

// Schémas de validation
const bulkActionSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "Au moins un ID requis"),
  action: z.enum(["status", "category"]),
  value: z.string().min(1, "Valeur requise"),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "Au moins un ID requis"),
});

// PATCH - Modifier en masse
export const PATCH = withApiLogger(async (req: NextRequest) => {
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

    // Validation du body
    const body = await req.json();
    const validatedData = bulkActionSchema.parse(body) as BulkActionData;

    const { ids, action, value } = validatedData;

    // Mise à jour en masse avec transaction
    let result;

    switch (action) {
      case "status":
        if (value !== "DRAFT" && value !== "PUBLISHED") {
          apiLogger.warn(`Statut invalide dans action bulk : ${value}`);
          return loggedErrorResponse("Statut invalide. Utilisez DRAFT ou PUBLISHED", 400);
        }

        result = await prisma.$transaction(async (tx) => {
          const updated = await tx.product.updateMany({
            where: { id: { in: ids } },
            data: {
              status: value as "DRAFT" | "PUBLISHED",
              updatedAt: new Date(),
            },
          });
          return updated;
        });
        break;

      case "category":
        // Vérifier que la catégorie existe
        const categoryExists = await prisma.category.findUnique({
          where: { id: value },
        });

        if (!categoryExists) {
          apiLogger.warn(`Catégorie inexistante dans action bulk : ${value}`);
          return loggedErrorResponse("Catégorie introuvable", 404);
        }

        result = await prisma.$transaction(async (tx) => {
          const updated = await tx.product.updateMany({
            where: { id: { in: ids } },
            data: {
              categoryId: value,
              updatedAt: new Date(),
            },
          });
          return updated;
        });
        break;

      default:
        return loggedErrorResponse("Action non supportée", 400);
    }

    productLogger.info(
      LogMessages.admin.actionEffectuee(
        session.user.email || "unknown",
        `Modification ${action} en masse : ${result.count} produits modifiés`
      )
    );

    return loggedSuccessResponse({
      message: `${result.count} produit(s) modifié(s) avec succès`,
      count: result.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return loggedErrorResponse("Données invalides", 400);
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur modification bulk produits : ${message}`);
    return loggedErrorResponse(`Erreur lors de la modification : ${message}`, 500);
  }
});

// DELETE - Supprimer en masse
export const DELETE = withApiLogger(async (req: NextRequest) => {
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

    // Validation du body
    const body = await req.json();
    const validatedData = bulkDeleteSchema.parse(body) as BulkDeleteData;

    const { ids } = validatedData;

    // Suppression en masse avec transaction
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier s'il existe des OrderItems liés à ces produits
      const orderItemsCount = await tx.orderItem.count({
        where: {
          productId: { in: ids },
        },
      });

      if (orderItemsCount > 0) {
        throw new Error(
          `Impossible de supprimer : ${orderItemsCount} commande(s) contiennent ces produits`
        );
      }

      // Suppression des produits
      const deleted = await tx.product.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      return deleted;
    });

    productLogger.info(
      LogMessages.admin.actionEffectuee(
        session.user.email || "unknown",
        `Suppression en masse : ${result.count} produits supprimés`
      )
    );

    return loggedSuccessResponse({
      message: `${result.count} produit(s) supprimé(s) avec succès`,
      count: result.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return loggedErrorResponse("Données invalides", 400);
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur suppression bulk produits : ${message}`);
    return loggedErrorResponse(message, 500);
  }
});
