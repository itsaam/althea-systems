import { NextRequest } from "next/server";
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  apiLogger,
} from "@/lib/logger/exports";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  subDays,
  subWeeks,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";

// Validation du query param
const querySchema = z.object({
  period: z.enum(["7days", "5weeks"]).default("7days"),
});

interface CartAnalysisDataPoint {
  period: string;
  categories: Record<string, number>;
}

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification auth et rôle ADMIN
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès à cart-analysis sans autorisation");
      return loggedErrorResponse("Non autorisé", 401);
    }

    // Validation du query param
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") || "7days";

    const validation = querySchema.safeParse({ period: periodParam });
    if (!validation.success) {
      return loggedErrorResponse(
        `Paramètre invalide: ${validation.error.issues[0].message}`,
        400
      );
    }

    const { period } = validation.data;
    const now = new Date();
    const data: CartAnalysisDataPoint[] = [];

    // Calculer les bornes de la période complète
    let periodStart: Date;
    let periodEnd: Date;

    if (period === "7days") {
      periodStart = startOfDay(subDays(now, 6));
      periodEnd = endOfDay(now);
    } else {
      periodStart = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
    }

    // UNE SEULE requête pour toute la période
    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (period === "7days") {
      // Analyser les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const targetDate = subDays(now, i);
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);

        // Filtrer les commandes en mémoire pour ce jour
        const orders = allOrders.filter(
          (order) => order.createdAt >= dayStart && order.createdAt <= dayEnd
        );

        // Calculer le panier moyen par catégorie PAR COMMANDE
        const categoryTotalsByOrder = new Map<string, Map<string, number>>();

        for (const order of orders) {
          const orderCategorySums = new Map<string, number>();

          for (const item of order.items) {
            const categoryName =
              item.product.category?.name || "Sans catégorie";
            const itemTotal = Number(item.price) * item.quantity;
            orderCategorySums.set(
              categoryName,
              (orderCategorySums.get(categoryName) || 0) + itemTotal
            );
          }

          // Stocker les totaux par commande
          for (const [cat, sum] of orderCategorySums) {
            if (!categoryTotalsByOrder.has(cat)) {
              categoryTotalsByOrder.set(cat, new Map());
            }
            categoryTotalsByOrder.get(cat)!.set(order.id, sum);
          }
        }

        // Calculer la moyenne par catégorie
        const categories: Record<string, number> = {};
        for (const [categoryName, orderSums] of categoryTotalsByOrder) {
          const total = Array.from(orderSums.values()).reduce(
            (a, b) => a + b,
            0
          );
          const orderCount = orderSums.size; // Nombre de COMMANDES
          categories[categoryName] = total / orderCount;
        }

        data.push({
          period: format(targetDate, "dd MMM", { locale: fr }),
          categories,
        });
      }
    } else {
      // Analyser les 5 dernières semaines
      for (let i = 4; i >= 0; i--) {
        const targetDate = subWeeks(now, i);
        const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

        // Filtrer les commandes en mémoire pour cette semaine
        const orders = allOrders.filter(
          (order) => order.createdAt >= weekStart && order.createdAt <= weekEnd
        );

        // Calculer le panier moyen par catégorie PAR COMMANDE
        const categoryTotalsByOrder = new Map<string, Map<string, number>>();

        for (const order of orders) {
          const orderCategorySums = new Map<string, number>();

          for (const item of order.items) {
            const categoryName =
              item.product.category?.name || "Sans catégorie";
            const itemTotal = Number(item.price) * item.quantity;
            orderCategorySums.set(
              categoryName,
              (orderCategorySums.get(categoryName) || 0) + itemTotal
            );
          }

          // Stocker les totaux par commande
          for (const [cat, sum] of orderCategorySums) {
            if (!categoryTotalsByOrder.has(cat)) {
              categoryTotalsByOrder.set(cat, new Map());
            }
            categoryTotalsByOrder.get(cat)!.set(order.id, sum);
          }
        }

        // Calculer la moyenne par catégorie
        const categories: Record<string, number> = {};
        for (const [categoryName, orderSums] of categoryTotalsByOrder) {
          const total = Array.from(orderSums.values()).reduce(
            (a, b) => a + b,
            0
          );
          const orderCount = orderSums.size; // Nombre de COMMANDES
          categories[categoryName] = total / orderCount;
        }

        data.push({
          period: `S${format(weekStart, "ww", { locale: fr })}`,
          categories,
        });
      }
    }

    apiLogger.info(`Analyse des paniers récupérée pour période: ${period}`);
    return loggedSuccessResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(
      `Erreur lors de la récupération de l'analyse des paniers: ${message}`
    );
    return loggedErrorResponse(`Erreur serveur: ${message}`, 500);
  }
});
