import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error); // fallback si ce n'est pas une instance d'Error
}

// GET Détails d'une adresse
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const address = await prisma.address.findUnique({
      where: { id },
      include: {
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

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Erreur lors de la récupération de l'adresse : ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }
}

// PATCH Mise à jour d'une adresse
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const currentAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!currentAddress) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    if (body.isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: currentAddress.userId,
          id: { not: id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedAddress);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour de l'adresse : ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }
}

// DELETE Supprimer une adresse
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const ordersCount = await prisma.order.count({
      where: { addressId: id },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une adresse utilisée dans des commandes' },
        { status: 400 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Adresse supprimée avec succès' });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Erreur lors de la suppression de l'adresse : ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }
}
