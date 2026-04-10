import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";
import { generateCreditNotePDF } from "@/lib/credit-note-pdf";
import { sendCreditNoteEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const emailsEnabled = () => process.env.EMAILS_ENABLED !== "false";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const DELETE = withApiLogger(async (req: NextRequest, context: unknown) => {
  try {

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const { id } = await (context as RouteContext).params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason ?? "CANCELLATION";

    if (!["CANCELLATION", "REFUND", "ERROR"].includes(reason)) {
      return loggedErrorResponse("Raison invalide (CANCELLATION, REFUND, ERROR)", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            address: true,
            items: {
              include: { product: { select: { tva: true } } },
            },
          },
        },
        creditNotes: true,
      },
    });

    if (!invoice) return loggedErrorResponse("Facture non trouvée", 404);

    if (invoice.status === "CANCELLED") {
      return loggedErrorResponse("Cette facture est déjà annulée", 400);
    }

    if (invoice.creditNotes.length > 0) {
      return loggedErrorResponse("Un avoir existe déjà pour cette facture", 400);
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000 + 1000);
    const creditNumber = `AVOIR-${year}${month}-${rand}`;

    const creditNote = await prisma.$transaction(async (tx) => {
      const cn = await tx.creditNote.create({
        data: {
          creditNumber,
          orderId: invoice.orderId,
          invoiceId: invoice.id,
          amount: invoice.amount,
          reason,
        },
      });

      await tx.invoice.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return cn;
    });

    let pdfBuffer: Buffer | null = null;
    try {
      await generateCreditNotePDF({
        creditNumber: creditNote.creditNumber,
        creditNoteId: creditNote.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        orderNumber: invoice.order.orderNumber,
        createdAt: creditNote.createdAt,
        reason,
        user: {
          firstName: invoice.order.user.firstName,
          lastName: invoice.order.user.lastName,
          email: invoice.order.user.email,
        },
        address: {
          firstName: invoice.order.address.firstName,
          lastName: invoice.order.address.lastName,
          street: invoice.order.address.street,
          street2: invoice.order.address.street2,
          city: invoice.order.address.city,
          postalCode: invoice.order.address.postalCode,
          country: invoice.order.address.country,
        },
        items: invoice.order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          tva: item.product.tva,
        })),
        subtotal: Number(invoice.order.subtotal),
        shippingCost: Number(invoice.order.shippingCost),
        tax: Number(invoice.order.tax),
        total: Number(invoice.amount),
      });

      const pdfPath = join(
        process.cwd(),
        "public",
        "invoices",
        `${creditNote.creditNumber}.pdf`
      );
      pdfBuffer = await readFile(pdfPath);
    } catch (pdfError) {
      const pdfMsg =
        pdfError instanceof Error ? pdfError.message : "Erreur inconnue";
      apiLogger.error(
        `Erreur génération PDF avoir ${creditNote.creditNumber}: ${pdfMsg}`
      );
    }

    if (emailsEnabled() && pdfBuffer && invoice.order.user.email) {
      try {
        await sendCreditNoteEmail(
          invoice.order.user.email,
          creditNote.creditNumber,
          pdfBuffer,
          invoice.orderId
        );
        apiLogger.info(
          `Email avoir ${creditNote.creditNumber} envoyé à ${invoice.order.user.email}`
        );
      } catch (emailError) {
        const emailMsg =
          emailError instanceof Error ? emailError.message : "Erreur inconnue";
        apiLogger.warn(
          `Email avoir ${creditNote.creditNumber} non envoyé: ${emailMsg}`
        );
      }
    }

    return loggedSuccessResponse({
      message: "Facture annulée et avoir créé",
      creditNote: {
        id: creditNote.id,
        creditNumber: creditNote.creditNumber,
        amount: Number(creditNote.amount),
        reason: creditNote.reason,
        invoiceId: id,
        invoiceNumber: invoice.invoiceNumber,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur annulation facture: ${message}`, 500);
  }
});

export const GET = withApiLogger(async (_req: NextRequest, context: unknown) => {
  try {
    const { id } = await (context as RouteContext).params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
          },
        },
        creditNotes: {
          select: {
            id: true,
            creditNumber: true,
            amount: true,
            reason: true,
            createdAt: true,
          },
        },
      },
    });

    if (!invoice) return loggedErrorResponse("Facture non trouvée", 404);

    return loggedSuccessResponse({ invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération facture: ${message}`, 500);
  }
});