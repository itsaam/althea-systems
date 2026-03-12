import { NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, InvoiceStatus } from "@prisma/client";
import type Stripe from "stripe";
import { apiLogger } from "@/lib/logger/exports";

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    apiLogger.error(`Webhook signature verification failed: ${message}`);
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

          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: OrderStatus.CONFIRMED,
              paymentStatus: PaymentStatus.PAID,
              paymentIntentId,
              paymentDate: new Date(),
              updatedAt: new Date(),
            },
          });

          apiLogger.info(`Paiement confirmé pour commande ${orderId}`);

          const customerId = "customer" in session ? session.customer : null;

          let stripeInvoice: Stripe.Invoice | null = null;
          if (customerId && typeof customerId === "string") {
            stripeInvoice = await stripe.instance.invoices.create({
              customer: customerId,
              description: `Invoice for order #${orderId}`,
              auto_advance: true,
            });
            apiLogger.info(`Facture Stripe créée: ${stripeInvoice.id} pour commande ${orderId}`);
          }

          const existingInvoice = await prisma.invoice.findUnique({
            where: { orderId },
          });

          if (!existingInvoice) {
            const invoice = await prisma.invoice.create({
              data: {
                invoiceNumber: generateInvoiceNumber(),
                orderId,
                userId: order.userId,
                amount: order.total,
                status: InvoiceStatus.PAID,
                pdfUrl: stripeInvoice?.invoice_pdf ?? null,
              },
            });
            apiLogger.info(`Invoice DB créée: ${invoice.invoiceNumber} pour commande ${orderId}`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            await Promise.all(
              order.items.map((item) =>
                prisma.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                })
              )
            );
            apiLogger.warn(`Stock restauré après échec paiement commande ${orderId}`);
          }

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
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order) {
            await Promise.all(
              order.items.map((item) =>
                prisma.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                })
              )
            );
            apiLogger.info(`Stock restauré après remboursement commande ${orderId}`);
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
          apiLogger.info(`Carte par défaut mise à jour pour customer ${customerId}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur traitement webhook ${event.type}: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}