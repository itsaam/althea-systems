import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("🔵 [SAVED-CARD-PAYMENT] Starting payment with saved card");
    
    const sessionAuth = await getServerSession(authOptions);
    
    if (!sessionAuth || !sessionAuth.user?.id) {
      console.log("❌ [SAVED-CARD-PAYMENT] Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionAuth.user.id;
    console.log("🔵 [SAVED-CARD-PAYMENT] User ID:", userId);

    const body = await req.json();
    const { amount, orderId } = body;
    console.log("🔵 [SAVED-CARD-PAYMENT] Body:", { amount, orderId });

    if (!amount || !orderId) {
      console.log("❌ [SAVED-CARD-PAYMENT] Missing parameters");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      console.log("❌ [SAVED-CARD-PAYMENT] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      console.log("❌ [SAVED-CARD-PAYMENT] No Stripe customer ID");
      return NextResponse.json({ 
        error: "No Stripe customer found. Please complete a checkout first." 
      }, { status: 404 });
    }

    console.log("🔵 [SAVED-CARD-PAYMENT] Fetching saved payment methods...");
    const paymentMethods = await stripe.instance.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    console.log("🔵 [SAVED-CARD-PAYMENT] Found payment methods:", paymentMethods.data.length);

    if (paymentMethods.data.length === 0) {
      console.log("❌ [SAVED-CARD-PAYMENT] No saved cards found");
      return NextResponse.json({ 
        error: "No saved cards found. Please add a payment method first." 
      }, { status: 404 });
    }

    const paymentMethodId = paymentMethods.data[0].id;
    console.log("🔵 [SAVED-CARD-PAYMENT] Using payment method:", paymentMethodId);

    console.log("🔵 [SAVED-CARD-PAYMENT] Creating payment intent...");
    const paymentIntent = await stripe.instance.paymentIntents.create({
      amount: amount,
      currency: "eur",
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: { orderId },
    });

    console.log("✅ [SAVED-CARD-PAYMENT] Payment successful:", paymentIntent.status);
    
    return NextResponse.json({ 
      success: true, 
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status 
    });
    
  } catch (error: unknown) {
    console.error("❌ [SAVED-CARD-PAYMENT] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("❌ [SAVED-CARD-PAYMENT] Error stack:", errorStack);
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined 
    }, { status: 500 });
  }
}