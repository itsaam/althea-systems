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
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface KPIsResponse {
  revenue: {
    day: number;
    week: number;
    month: number;
  };
  ordersToday: number;
  lowStockAlerts: number;
  unreadMessages: number;
}

export const GET = withApiLogger(async (_req: NextRequest) => {
  try {
    // Vérification auth et rôle ADMIN
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès aux KPIs sans autorisation");
      return loggedErrorResponse("Non autorisé", 401);
    }

    const now = new Date();

    // Calcul des périodes
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Lundi
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Parallel queries pour optimiser les performances
    const [revenueDay, revenueWeek, revenueMonth, ordersToday, lowStockCount, unreadCount] =
      await Promise.all([
        // CA du jour (commandes PAID)
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
          _sum: {
            total: true,
          },
        }),

        // CA de la semaine
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            createdAt: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
          _sum: {
            total: true,
          },
        }),

        // CA du mois
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            total: true,
          },
        }),

        // Commandes créées aujourd'hui
        prisma.order.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        }),

        // Produits avec stock faible (< 10)
        prisma.product.count({
          where: {
            stock: {
              lt: 10,
            },
            status: "PUBLISHED", // Seulement les produits publiés
          },
        }),

        // Messages non lus
        prisma.contactMessage.count({
          where: {
            read: false,
          },
        }),
      ]);

    const response: KPIsResponse = {
      revenue: {
        day: Number(revenueDay._sum.total || 0),
        week: Number(revenueWeek._sum.total || 0),
        month: Number(revenueMonth._sum.total || 0),
      },
      ordersToday,
      lowStockAlerts: lowStockCount,
      unreadMessages: unreadCount,
    };

    apiLogger.info(
      `KPIs récupérés: CA jour=${response.revenue.day}€, commandes=${ordersToday}, stock faible=${lowStockCount}, messages=${unreadCount}`
    );

    return loggedSuccessResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur lors de la récupération des KPIs: ${message}`);
    return loggedErrorResponse(`Erreur serveur: ${message}`, 500);
  }
});
