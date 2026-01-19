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
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès à category-sales sans autorisation");
      return loggedErrorResponse("Non autorisé", 401);
    }

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

    let periodStart: Date;
    let periodEnd: Date;

    if (period === "7days") {
      periodStart = startOfDay(subDays(now, 6));
      periodEnd = endOfDay(now);
    } else {
      periodStart = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
    }

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

    const data: CategorySalesDataPoint[] = Array.from(
      categorySales.entries()
    ).map(([name, value]) => ({
      name,
      value,
      percentage: totalSales > 0 ? (value / totalSales) * 100 : 0,
    }));

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
