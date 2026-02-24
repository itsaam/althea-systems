import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// POST Définir comme adresse par défaut
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: address.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.address.update({
        where: { id },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Adresse définie par défaut avec succès' });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour de l'adresse : ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }
}
