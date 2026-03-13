import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CreateOrderRequest {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItemInput[];
  subtotal: number;
  shipping: number;
}

export async function GET() {
  // TODO: Fetch all orders
  return NextResponse.json({ orders: [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderRequest;

    const { shippingAddress, items, subtotal, shipping } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Panier vide" },
        { status: 400 }
      );
    }

    // Validation basique
    if (!shippingAddress.firstName || !shippingAddress.email) {
      return NextResponse.json(
        { message: "Données d'adresse incomplètes" },
        { status: 400 }
      );
    }

    // Récupérer ou créer un utilisateur anonyme (DEV1 pas d'auth)
    let user = await prisma.user.findUnique({
      where: { email: shippingAddress.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: shippingAddress.email,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          emailVerified: null, // Non vérifié (utilisateur anonyme)
        },
      });
    }

    // Créer l'adresse de livraison
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        street: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
        isDefault: false,
      },
    });

    // Calculer les totaux
    const tax = Math.round((subtotal * 0.2) * 100) / 100; // 20% TVA
    const total = subtotal + shipping + tax;

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: address.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Créer un Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // En centimes
      currency: "eur",
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: shippingAddress.email,
      },
      receipt_email: shippingAddress.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientSecret: paymentIntent.client_secret,
        total: order.total,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
