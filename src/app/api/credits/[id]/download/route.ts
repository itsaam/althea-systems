import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import { withApiLogger, loggedErrorResponse } from "@/lib/logger/exports";
import { generateCreditNotePDF } from "@/lib/credit-note-pdf";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {

    const session = await getServerSession(authOptions);
    if (!session) return loggedErrorResponse("Non autorisé", 401);

    const { id } = await (context as RouteContext).params;

    const creditNote = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        invoice: {
          select: { invoiceNumber: true, pdfUrl: true },
        },
        order: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
            address: true,
            items: {
              include: { product: { select: { tva: true } } },
            },
          },
        },
      },
    });

    if (!creditNote) return loggedErrorResponse("Avoir non trouvé", 404);

    const filename = `${creditNote.creditNumber}.pdf`;
    const filepath = join(process.cwd(), "public", "invoices", filename);

    // Régénérer le PDF si manquant
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = readFileSync(filepath);
    } catch {
      // PDF manquant → régénérer
      try {
        await generateCreditNotePDF({
          creditNumber: creditNote.creditNumber,
          creditNoteId: creditNote.id,
          invoiceNumber: creditNote.invoice?.invoiceNumber ?? "",
          orderId: creditNote.orderId,
          orderNumber: creditNote.order.orderNumber,
          createdAt: creditNote.createdAt,
          reason: creditNote.reason,
          user: {
            firstName: creditNote.order.user.firstName,
            lastName: creditNote.order.user.lastName,
            email: creditNote.order.user.email,
          },
          address: {
            firstName: creditNote.order.address.firstName,
            lastName: creditNote.order.address.lastName,
            street: creditNote.order.address.street,
            street2: creditNote.order.address.street2,
            city: creditNote.order.address.city,
            postalCode: creditNote.order.address.postalCode,
            country: creditNote.order.address.country,
          },
          items: creditNote.order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
            tva: item.product.tva,
          })),
          subtotal: Number(creditNote.order.subtotal),
          shippingCost: Number(creditNote.order.shippingCost),
          tax: Number(creditNote.order.tax),
          total: Number(creditNote.amount),
        });
        pdfBuffer = readFileSync(filepath);
      } catch (genError) {
        const msg = genError instanceof Error ? genError.message : "Erreur inconnue";
        return loggedErrorResponse(`Impossible de générer le PDF: ${msg}`, 500);
      }
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur téléchargement avoir: ${message}`, 500);
  }
});