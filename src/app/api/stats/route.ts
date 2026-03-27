import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from '@/lib/logger/exports';

// GET Statistiques du dashboard admin
export const GET = withApiLogger(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return loggedErrorResponse('Non autorisé', 403);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const days = parseInt(period, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Récupération des statistiques principales
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      totalRevenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          items: { select: { quantity: true } },
        },
      }),
    ]);

    // Ventes par jour
    const salesByDay = await prisma.$queryRaw<
      { date: string; orders: number; revenue: number }[]
    >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND status != 'CANCELLED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Top produits
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, images: true, price: true },
        });
        return {
          ...product,
          price: product?.price ? Number(product.price) : 0,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.id,
        };
      })
    );

    // Commandes par statut
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return loggedSuccessResponse({
      overview: {
        totalUsers,
        totalOrders,
        pendingOrders,
        totalProducts,
        activeProducts,
        totalRevenue: Number(totalRevenueResult._sum.total || 0),
      },
      salesByDay,
      topProducts: topProductsWithDetails,
      ordersByStatus,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email,
        total: Number(order.total),
        status: order.status,
        itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    apiLogger.error(`Stats error: ${message}`, { stack: error instanceof Error ? error.stack : undefined });
    return loggedErrorResponse('Erreur lors de la récupération des statistiques', 500);
  }
});
