import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Récupérer un utilisateur avec adresses et commandes
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;

    const ordersFormatted = userWithoutPassword.orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
    }));

    return NextResponse.json({
      ...userWithoutPassword,
      orders: ordersFormatted,
    });
  } catch (error) {
    console.error('GET user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH Mettre à jour un utilisateur
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { password, ...updateData } = body; 

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PATCH user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE Supprimer un utilisateur si pas de commandes/adresses
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: { select: { id: true } },
        addresses: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.orders.length > 0 || user.addresses.length > 0) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer l’utilisateur : il possède des commandes ou des adresses associées',
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l’utilisateur' },
      { status: 500 }
    );
  }
}
