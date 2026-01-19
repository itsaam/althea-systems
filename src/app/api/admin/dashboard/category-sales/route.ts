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
} from "date-fns";
import { z } from "zod";

// Validation du query param
const querySchema = z.object({
  period: z.enum(["7days", "5weeks"]).default("7days"),
});

interface CategorySalesDataPoint {
  name: string;
  value: number;
  percentage: number;
}

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification auth et rôle ADMIN
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès à category-sales sans autorisation");
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

    // Calcul des dates de début et fin selon la période
    let periodStart: Date;
    let periodEnd: Date;

    if (period === "7days") {
      periodStart = startOfDay(subDays(now, 6));
      periodEnd = endOfDay(now);
    } else {
      periodStart = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
    }

    // Récupérer toutes les commandes payées de la période avec leurs items et produits
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
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

    // Calcul des ventes par catégorie
    const categorySales = new Map<string, number>();
    let totalSales = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const categoryName = item.product.category?.name || "Sans catégorie";
        const itemTotal = Number(item.price) * item.quantity;

        categorySales.set(
          categoryName,
          (categorySales.get(categoryName) || 0) + itemTotal
        );
        totalSales += itemTotal;
      }
    }

    // Transformer en tableau avec pourcentages
    const data: CategorySalesDataPoint[] = Array.from(
      categorySales.entries()
    ).map(([name, value]) => ({
      name,
      value,
      percentage: totalSales > 0 ? (value / totalSales) * 100 : 0,
    }));

    // Trier par valeur décroissante
    data.sort((a, b) => b.value - a.value);

    apiLogger.info(
      `Répartition des ventes par catégorie récupérée pour période: ${period} (${data.length} catégories)`
    );
    return loggedSuccessResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(
      `Erreur lors de la récupération des ventes par catégorie: ${message}`
    );
    return loggedErrorResponse(`Erreur serveur: ${message}`, 500);
  }
});
