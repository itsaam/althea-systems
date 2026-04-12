import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserCurrency, convertFromEur, isCurrencySupported } from "@/lib/currency";

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

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    
    if (!authSession || !authSession.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = authSession.user.id;
    const body = await req.json();
    const { items, orderId } = body as { items: CheckoutItem[]; orderId: string };

    if (!items || !orderId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let currency = await getUserCurrency(userId, prisma);
    
    if (!isCurrencySupported(currency)) {
      currency = "eur";
    }

    for (const item of items) {
      const productId = item.price_data?.product_data?.metadata?.productId;
      const quantity = item.quantity;

      if (productId) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, stock: true },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Produit non trouvé` },
            { status: 404 }
          );
        }

        if (product.stock < quantity) {
          return NextResponse.json(
            { 
              error: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`,
              productName: product.name,
              available: product.stock,
              requested: quantity,
            },
            { status: 400 }
          );
        }
      }
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

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

    const convertedItems = items.map((item: CheckoutItem) => {
      const originalAmount = item.price_data.unit_amount;
      const convertedAmount = currency === "eur" 
        ? originalAmount 
        : convertFromEur(originalAmount, currency);

      return {
        ...item,
        price_data: {
          ...item.price_data,
          currency: currency,
          unit_amount: convertedAmount,
        },
      };
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.instance.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: convertedItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { orderId, currency },
      },
      metadata: {
        orderId,
        currency,
      },
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      currency: currency,
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: errorMessage,
    }, { status: 500 });
  }
}