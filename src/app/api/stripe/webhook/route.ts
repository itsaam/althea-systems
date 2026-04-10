import { NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, InvoiceStatus } from "@prisma/client";
import type Stripe from "stripe";
import { apiLogger } from "@/lib/logger/exports";
import { generateInvoicePDF } from "@/lib/pdf";
import { uploadToR2 } from "@/lib/r2";
import { sendInvoiceEmail } from "@/lib/email";

const emailsEnabled = () => process.env.EMAILS_ENABLED !== "false";

async function generateInvoiceNumber(): Promise<string> {
  const date   = new Date();
  const year   = date.getFullYear();
  const month  = String(date.getMonth() + 1).padStart(2, "0");
  const period = `${year}${month}`;

  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${period}-` } },
  });

  return `INV-${period}-${String(count + 1).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    apiLogger.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  const session = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.PaymentIntent
    | Stripe.Charge
    | Stripe.SetupIntent;

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
              status:          OrderStatus.CONFIRMED,
              paymentStatus:   PaymentStatus.PAID,
              paymentIntentId,
              paymentDate:     new Date(),
              updatedAt:       new Date(),
            },
            include: {
              items:   { include: { product: true } },
              address: true,
              user:    true,
            },
          });

          apiLogger.info(`Paiement confirmé pour commande ${orderId}`);

          const existing = await prisma.invoice.findUnique({ where: { orderId } });

          if (!existing) {
            const invoiceNumber = await generateInvoiceNumber();

            const tvaMap: Record<string, number> = {
              TVA_20: 0.20, TVA_10: 0.10, TVA_5_5: 0.055, TVA_0: 0,
            };

            const pdfBuffer = await generateInvoicePDF({
              invoiceNumber,
              createdAt:    new Date(),
              isPaid:       true,
              customer: {
                name:       order.user.name ?? `${order.address.firstName} ${order.address.lastName}`,
                email:      order.user.email,
                address:    `${order.address.street}${order.address.street2 ? ", " + order.address.street2 : ""}`,
                postalCode: order.address.postalCode,
                city:       order.address.city,
                country:    order.address.country,
              },
              items: order.items.map((item) => ({
                name:         item.name,
                quantity:     item.quantity,
                unitPriceTTC: Number(item.price),
                tvaRate:      tvaMap[item.product.tva] ?? 0.20,
              })),
              shippingCost: Number(order.shippingCost),
              total:        Number(order.total),
            });

            // Upload vers R2 — non bloquant : si ça échoue, la facture est quand même créée
            // et le PDF sera généré à la volée via GET /api/invoices/[id]/download
            let pdfUrl: string | null = null;
            try {
              pdfUrl = await uploadToR2(
                pdfBuffer,
                `${invoiceNumber}.pdf`,
                "application/pdf",
                "invoices"
              );
            } catch (r2Error) {
              const r2Message = r2Error instanceof Error ? r2Error.message : "Erreur inconnue";
              apiLogger.warn(`R2 upload échoué pour ${invoiceNumber}, facture sans URL: ${r2Message}`);
            }

            // upsert sur invoiceNumber pour gérer le race condition
            // quand Stripe envoie checkout.session.completed + payment_intent.succeeded simultanément
            const invoice = await prisma.invoice.upsert({
              where:  { invoiceNumber },
              update: { pdfUrl: pdfUrl ?? undefined }, // met à jour l'URL si le 2e event arrive après un upload réussi
              create: {
                invoiceNumber,
                orderId,
                userId: order.userId,
                amount: order.total,
                status: InvoiceStatus.PAID,
                pdfUrl,
              },
            });

            apiLogger.info(
              pdfUrl
                ? `Facture créée: ${invoice.invoiceNumber} — R2: ${pdfUrl}`
                : `Facture créée: ${invoice.invoiceNumber} — sans URL R2 (génération à la volée activée)`
            );

            if (emailsEnabled() && order.user.email) {
              try {
                await sendInvoiceEmail(
                  order.user.email,
                  invoice.invoiceNumber,
                  pdfBuffer,
                  orderId
                );
                apiLogger.info(
                  `Email facture ${invoice.invoiceNumber} envoyé à ${order.user.email}`
                );
              } catch (emailError) {
                const emailMsg =
                  emailError instanceof Error ? emailError.message : "Erreur inconnue";
                apiLogger.warn(
                  `Email facture ${invoice.invoiceNumber} non envoyé: ${emailMsg}`
                );
              }
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        if (orderId) {
          const order = await prisma.order.findUnique({
            where:   { id: orderId },
            include: { items: true },
          });

          if (order) {
            await Promise.all(
              order.items.map((item) =>
                prisma.product.update({
                  where: { id: item.productId },
                  data:  { stock: { increment: item.quantity } },
                })
              )
            );
            apiLogger.warn(`Stock restauré après échec paiement commande ${orderId}`);
          }

          await prisma.order.update({
            where: { id: orderId },
            data:  { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED, updatedAt: new Date() },
          });
        }
        break;
      }

      case "charge.refunded": {
        if (orderId) {
          const order = await prisma.order.findUnique({
            where:   { id: orderId },
            include: { items: true },
          });

          if (order) {
            await Promise.all(
              order.items.map((item) =>
                prisma.product.update({
                  where: { id: item.productId },
                  data:  { stock: { increment: item.quantity } },
                })
              )
            );
          }

          await prisma.order.update({
            where: { id: orderId },
            data:  { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED, updatedAt: new Date() },
          });
        } else {
          const paymentIntentId =
            "payment_intent" in session && typeof session.payment_intent === "string"
              ? session.payment_intent : null;

          if (paymentIntentId) {
            await prisma.order.updateMany({
              where: { paymentIntentId },
              data:  { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED, updatedAt: new Date() },
            });
          }
        }
        break;
      }

      case "setup_intent.succeeded": {
        const customerId      = "customer"       in session ? session.customer       : null;
        const paymentMethodId = "payment_method" in session ? session.payment_method : null;

        if (customerId && typeof customerId === "string" && paymentMethodId && typeof paymentMethodId === "string") {
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