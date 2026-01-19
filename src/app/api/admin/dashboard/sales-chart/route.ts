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

const querySchema = z.object({
  period: z.enum(["7days", "5weeks"]).default("7days"),
});

interface SalesChartDataPoint {
  date: string;
  sales: number;
  orders: number;
}

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès au sales-chart sans autorisation");
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
    const data: SalesChartDataPoint[] = [];

    let periodStart: Date;
    let periodEnd: Date;

    if (period === "7days") {
      periodStart = startOfDay(subDays(now, 6));
      periodEnd = endOfDay(now);
    } else {
      periodStart = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
    }

    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        id: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    if (period === "7days") {
      for (let i = 6; i >= 0; i--) {
        const targetDate = subDays(now, i);
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);

        const dayOrders = allOrders.filter(
          (order) => order.createdAt >= dayStart && order.createdAt <= dayEnd
        );

        const sales = dayOrders
          .filter((order) => order.paymentStatus === "PAID")
          .reduce((sum, order) => sum + Number(order.total), 0);

        data.push({
          date: format(targetDate, "dd MMM", { locale: fr }),
          sales,
          orders: dayOrders.length,
        });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const targetDate = subWeeks(now, i);
        const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

        const weekOrders = allOrders.filter(
          (order) => order.createdAt >= weekStart && order.createdAt <= weekEnd
        );

        const sales = weekOrders
          .filter((order) => order.paymentStatus === "PAID")
          .reduce((sum, order) => sum + Number(order.total), 0);

        data.push({
          date: `S${format(weekStart, "ww", { locale: fr })}`,
          sales,
          orders: weekOrders.length,
        });
      }
    }

    apiLogger.info(`Données sales-chart récupérées pour période: ${period}`);
    return loggedSuccessResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur lors de la récupération du sales-chart: ${message}`);
    return loggedErrorResponse(`Erreur serveur: ${message}`, 500);
  }
});
