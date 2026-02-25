import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("🔵 [CHECKOUT] Starting checkout process");
    
    const authSession = await getServerSession(authOptions);
    console.log("🔵 [CHECKOUT] Auth session:", authSession);
    
    if (!authSession || !authSession.user?.id) {
      console.log("❌ [CHECKOUT] Unauthorized - No session or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = authSession.user.id;
    console.log("🔵 [CHECKOUT] User ID:", userId);

    const body = await req.json();
    console.log("🔵 [CHECKOUT] Body received:", { items: body.items?.length, orderId: body.orderId });
    
    const { items, orderId } = body;

    if (!items || !orderId) {
      console.log("❌ [CHECKOUT] Missing parameters");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    console.log("🔵 [CHECKOUT] Looking for user in database...");
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      console.log("❌ [CHECKOUT] User not found in database");
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("🔵 [CHECKOUT] User found:", user.email);

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      console.log("🔵 [CHECKOUT] Creating Stripe customer...");
      const customer = await stripe.instance.customers.create({
        email: user.email || "",
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      
      console.log("🔵 [CHECKOUT] Updating user with Stripe customer ID...");
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    console.log("🔵 [CHECKOUT] Creating Stripe checkout session...");
    const checkoutSession = await stripe.instance.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: items,
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { orderId },
      },
      metadata: {
        orderId,
      },
    });

    console.log("✅ [CHECKOUT] Success! Checkout URL:", checkoutSession.url);
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error: unknown) {
    console.error("❌ [CHECKOUT] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("❌ [CHECKOUT] Error stack:", errorStack);
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined 
    }, { status: 500 });
  }
}