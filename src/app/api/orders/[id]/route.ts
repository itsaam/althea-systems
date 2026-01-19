import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET Détails d'une commande
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur GET order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

// PATCH (Mettre à jour une commande)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: body,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur PATCH order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}

// DELETE (Annuler une commande)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (order.status === 'DELIVERED' || order.status === 'SHIPPED') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une commande livrée ou expédiée' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ 
      message: 'Commande annulée avec succès',
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Erreur DELETE order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}