import { NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err: unknown) {
    console.error("❌ [WEBHOOK] Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent | Stripe.Charge | Stripe.SetupIntent;
  const orderId = "metadata" in session ? session.metadata?.orderId : undefined;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded": {
        if (orderId) {
          const paymentIntentId = 
            "payment_intent" in session && typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.id;

          console.log("🔵 [WEBHOOK] Décrémentation du stock pour commande:", orderId);
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            for (const item of order.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });
              console.log(`✅ [WEBHOOK] Stock décrémenté: ${item.name} (-${item.quantity})`);
            }
          }

          await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: OrderStatus.CONFIRMED,
              paymentStatus: PaymentStatus.PAID,
              paymentIntentId,
              paymentDate: new Date(),
              updatedAt: new Date(),
            },
          });

          const customerId = "customer" in session ? session.customer : null;
          if (customerId && typeof customerId === "string") {
            await stripe.instance.invoices.create({
              customer: customerId,
              description: `Invoice for order #${orderId}`,
              auto_advance: true,
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED,
              updatedAt: new Date(),
            },
          });
        }
        break;
      }

      case "charge.refunded": {
        if (orderId) {

          console.log("🔵 [WEBHOOK] Restauration du stock pour commande remboursée:", orderId);
          
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            for (const item of order.items) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              });
              console.log(`✅ [WEBHOOK] Stock restauré: ${item.name} (+${item.quantity})`);
            }
          }

          await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.REFUNDED,
              updatedAt: new Date(),
            },
          });
        } else {
          const paymentIntentId = 
            "payment_intent" in session && typeof session.payment_intent === "string"
              ? session.payment_intent
              : null;

          if (paymentIntentId) {
            await prisma.order.updateMany({
              where: { paymentIntentId },
              data: {
                status: OrderStatus.CANCELLED,
                paymentStatus: PaymentStatus.REFUNDED,
                updatedAt: new Date(),
              },
            });
          }
        }
        break;
      }

      case "setup_intent.succeeded": {
        const customerId = "customer" in session ? session.customer : null;
        const paymentMethodId = "payment_method" in session ? session.payment_method : null;

        if (
          customerId && 
          typeof customerId === "string" && 
          paymentMethodId && 
          typeof paymentMethodId === "string"
        ) {
          await stripe.instance.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ [WEBHOOK] Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}