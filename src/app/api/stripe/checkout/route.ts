import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserCurrency, convertFromEur, isCurrencySupported } from "@/lib/currency";
import { apiLogger } from "@/lib/logger/exports";

interface PriceData {
  currency: string;
  unit_amount: number;
  product_data?: {
    name: string;
    metadata?: {
      productId?: string;
    };
  };
}

interface CheckoutItem {
  price_data: PriceData;
  quantity: number;
}

interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  region?: string;
  country: string;
}

const SHIPPING_COST = 10;
const TAX_RATE = 0.2;

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ALT-${y}${m}${d}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession || !authSession.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = authSession.user.id;
    const body = await req.json();
    const { items, address } = body as {
      items: CheckoutItem[];
      address: CheckoutAddress;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Panier vide" },
        { status: 400 }
      );
    }

    if (!address || !address.street || !address.city) {
      return NextResponse.json(
        { error: "Adresse manquante" },
        { status: 400 }
      );
    }

    // ── Vérification stock ────────────────────────────────
    const productIds: string[] = [];
    for (const item of items) {
      const productId = item.price_data?.product_data?.metadata?.productId;
      const quantity = item.quantity;

      if (productId) {
        productIds.push(productId);
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, stock: true, price: true },
        });

        if (!product) {
          return NextResponse.json(
            { error: "Produit non trouvé" },
            { status: 404 }
          );
        }

        if (product.stock < quantity) {
          return NextResponse.json(
            {
              error: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // ── Stripe customer ──────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.instance.customers.create({
        email: user.email || "",
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // ── Créer l'adresse en DB ────────────────────────────
    const savedAddress = await prisma.address.create({
      data: {
        userId,
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        street2: address.street2 || null,
        city: address.city,
        postalCode: address.postalCode,
        region: address.region || null,
        country: address.country,
        phone: address.phone || null,
      },
    });

    // ── Calculer les totaux ──────────────────────────────
    let subtotal = 0;
    const orderItems: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const productId =
        item.price_data?.product_data?.metadata?.productId || "";
      const name = item.price_data?.product_data?.name || "Produit";
      const unitPrice = item.price_data.unit_amount / 100; // cents → euros
      const quantity = item.quantity;

      subtotal += unitPrice * quantity;
      orderItems.push({ productId, name, price: unitPrice, quantity });
    }

    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + SHIPPING_COST + tax;

    // ── Créer la commande en DB (status PENDING) ─────────
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: savedAddress.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "stripe",
        subtotal,
        shippingCost: SHIPPING_COST,
        tax,
        total,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: "PENDING",
            changedBy: userId,
          },
        },
      },
    });

    // ── Décrémenter le stock ─────────────────────────────
    for (const item of orderItems) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    apiLogger.info(
      `Commande ${order.orderNumber} créée (${order.id}) — total ${total}€`
    );

    // ── Créer la session Stripe ──────────────────────────
    let currency = await getUserCurrency(userId, prisma);
    if (!isCurrencySupported(currency)) currency = "eur";

    const convertedItems = items.map((item: CheckoutItem) => {
      const originalAmount = item.price_data.unit_amount;
      const convertedAmount =
        currency === "eur"
          ? originalAmount
          : convertFromEur(originalAmount, currency);

      return {
        ...item,
        price_data: {
          ...item.price_data,
          currency,
          unit_amount: convertedAmount,
        },
      };
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const checkoutSession = await stripe.instance.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: convertedItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { orderId: order.id, currency },
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currency,
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      currency,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    apiLogger.error(`Erreur checkout: ${errorMessage}`);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
