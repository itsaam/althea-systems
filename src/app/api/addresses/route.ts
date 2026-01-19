import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addressSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// GET Liste des adresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des adresses' },
      { status: 500 }
    );
  }
}

// POST Créer une adresse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: validatedData.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: validatedData,
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'adresse' },
      { status: 500 }
    );
  }
}