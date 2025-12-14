import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Vérifier la signature Stripe
    const event = await constructWebhookEvent(body, signature);

    // TODO: Gérer les différents événements Stripe
    switch (event.type) {
      case "checkout.session.completed":
        // Traiter la commande
        break;
      case "payment_intent.succeeded":
        // Paiement réussi
        break;
      default:
        // Événement non géré
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
