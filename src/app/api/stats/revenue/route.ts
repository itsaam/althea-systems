import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  apiLogger,
} from '@/lib/logger/exports';

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';

    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { total: true, subtotal: true, tax: true, createdAt: true },
    });

    const revenueMap: Record<
      string,
      { total_orders: number; total_revenue: number; subtotal: number; total_tax: number; average_order: number }
    > = {};

    orders.forEach(o => {
      let key = '';
      const d = new Date(o.createdAt);

      switch (period) {
        case 'week':
          key = d.toISOString().slice(0, 10);
          break;
        case 'year':
          key = d.toISOString().slice(0, 7);
          break;
        default:
          key = d.toISOString().slice(0, 10);
      }

      if (!revenueMap[key]) {
        revenueMap[key] = { total_orders: 0, total_revenue: 0, subtotal: 0, total_tax: 0, average_order: 0 };
      }

      revenueMap[key].total_orders += 1;
      revenueMap[key].total_revenue += Number(o.total);
      revenueMap[key].subtotal += Number(o.subtotal);
      revenueMap[key].total_tax += Number(o.tax);
    });

    Object.values(revenueMap).forEach(v => {
      v.average_order = v.total_orders > 0 ? v.total_revenue / v.total_orders : 0;
    });

    const revenue = Object.entries(revenueMap)
      .map(([period, stats]) => ({ period, ...stats }))
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, 30);

    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);

    const previousPeriodStart = new Date(now);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    const previousPeriodEnd = new Date(now);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);

    const currentPeriodRevenue = orders.filter(o => new Date(o.createdAt) >= currentPeriodStart);
    const previousPeriodRevenue = orders.filter(
      o => new Date(o.createdAt) >= previousPeriodStart && new Date(o.createdAt) < previousPeriodEnd
    );

    const currentTotal = currentPeriodRevenue.reduce((sum, o) => sum + Number(o.total), 0);
    const previousTotal = previousPeriodRevenue.reduce((sum, o) => sum + Number(o.total), 0);

    const revenueGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    const ordersGrowth =
      previousPeriodRevenue.length > 0
        ? ((currentPeriodRevenue.length - previousPeriodRevenue.length) / previousPeriodRevenue.length) * 100
        : 0;

    return loggedSuccessResponse({
      revenue,
      comparison: {
        current: { revenue: currentTotal, orders: currentPeriodRevenue.length },
        previous: { revenue: previousTotal, orders: previousPeriodRevenue.length },
        growth: { revenue: revenueGrowth, orders: ordersGrowth },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`Revenue stats error: ${message}`, { stack: error instanceof Error ? error.stack : undefined });
    return loggedErrorResponse('Erreur lors de la récupération des statistiques de revenus', 500);
  }
});
