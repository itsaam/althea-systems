import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  userId: z.string(),
  addressId: z.string(),
  items: z.array(orderItemSchema),
  notes: z.string().optional(),
});

// Générer un numéro de commande unique
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
}

function calculateShippingCost(subtotal: number, country: string): number {
  // Tarifs selon le pays
  if (country === 'France' || country === 'FR') return 5.99;
  
  // Union Européenne
  const euCountries = ['BE', 'DE', 'ES', 'IT', 'NL', 'PT', 'LU', 'AT', 'IE', 'GR'];
  if (euCountries.includes(country)) return 9.99;
  
  // Reste du monde
  return 19.99;
}

// GET Liste des commandes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          address: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET Orders error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}

// POST Créer une commande
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const address = await prisma.address.findUnique({
      where: { id: validatedData.addressId },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    if (address.userId !== validatedData.userId) {
      return NextResponse.json(
        { error: 'Cette adresse ne vous appartient pas' },
        { status: 403 }
      );
    }

    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        active: true, 
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Produits non trouvés ou non disponibles: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { 
            error: `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}, Demandé: ${item.quantity}` 
          },
          { status: 400 }
        );
      }
    }

    let subtotal = 0;
    const taxRate = 0.20; // TVA par défaut 20%
    
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Produit non trouvé');
      
      const itemSubtotal = Number(product.price) * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const shippingCost = calculateShippingCost(subtotal, address.country);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    const order = await prisma.$transaction(async (tx) => {

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: validatedData.userId,
          addressId: validatedData.addressId,
          subtotal,
          shippingCost,
          tax,
          total,
          notes: validatedData.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                },
              },
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

      await Promise.all(
        validatedData.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
    
  } catch (error) {
    console.error('POST Order error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}