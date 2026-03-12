import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import { apiLogger } from "@/lib/logger/exports";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId: id },
      include: {
        order: {
          include: {
            items:   { include: { product: true } },
            address: true,
            user:    true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    // PDF déjà sur R2 → redirect direct
    if (invoice.pdfUrl) {
      return NextResponse.redirect(invoice.pdfUrl);
    }

    const { order } = invoice;
    const tvaMap: Record<string, number> = {
      TVA_20: 0.20, TVA_10: 0.10, TVA_5_5: 0.055, TVA_0: 0,
    };

    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      createdAt:     invoice.createdAt,
      isPaid:        invoice.status === "PAID",
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

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBuffer);
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length":      String(pdfBuffer.length),
        "Cache-Control":       "private, max-age=3600",
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur génération PDF facture commande ${id}: ${message}`);
    return NextResponse.json({ error: "Erreur génération PDF" }, { status: 500 });
  }
}