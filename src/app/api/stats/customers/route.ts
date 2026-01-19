import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Statistiques clients
export async function GET() {
  try {
    const topCustomersRaw = await prisma.user.findMany({
      where: {
        orders: { some: { status: { not: 'CANCELLED' } } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: { total: true },
        },
        _count: { select: { orders: true } },
      },
      take: 10,
    });

    const topCustomers = topCustomersRaw
      .map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        totalOrders: user._count.orders,
        totalSpent: user.orders.reduce((sum, o) => sum + Number(o.total), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const allUsers = await prisma.user.findMany({
      select: { createdAt: true },
    });

    const newCustomersByMonthMap: Record<string, number> = {};
    allUsers.forEach(u => {
      const month = u.createdAt.toISOString().slice(0, 7); 
      newCustomersByMonthMap[month] = (newCustomersByMonthMap[month] || 0) + 1;
    });

    const newCustomersByMonth = Object.entries(newCustomersByMonthMap)
      .sort((a, b) => b[0].localeCompare(a[0])) 
      .slice(0, 12)
      .map(([month, count]) => ({ month, count }));


    const usersWithOrders = await prisma.user.findMany({
      select: {
        id: true,
        orders: { where: { status: { not: 'CANCELLED' } }, select: { id: true } },
      },
    });

    const totalCustomersWithOrders = usersWithOrders.filter(u => u.orders.length > 0).length;
    const repeatCustomers = usersWithOrders.filter(u => u.orders.length > 1).length;
    const retentionRate = totalCustomersWithOrders > 0
      ? (repeatCustomers / totalCustomersWithOrders) * 100
      : 0;

    return NextResponse.json({
      topCustomers,
      newCustomersByMonth,
      retention: {
        total: totalCustomersWithOrders,
        repeat: repeatCustomers,
        rate: retentionRate,
      },
    });

  } catch (error) {
    console.error('Customer stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques clients' },
      { status: 500 }
    );
  }
}
