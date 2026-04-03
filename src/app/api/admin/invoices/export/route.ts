import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const format = req.nextUrl.searchParams.get("format") || "csv";
    const status = req.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && ["PENDING", "PAID", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
        creditNotes: { select: { creditNumber: true, amount: true } },
      },
    });

    const exportData = invoices.map((invoice) => ({
      "N° Facture": invoice.invoiceNumber,
      "N° Commande": invoice.order.orderNumber,
      Client: [invoice.order.user.firstName, invoice.order.user.lastName].filter(Boolean).join(" ") || invoice.order.user.email,
      Montant: `${Number(invoice.amount).toFixed(2)} €`,
      Statut: invoice.status === "PAID" ? "Payée" : invoice.status === "CANCELLED" ? "Annulée" : "En attente",
      Avoirs: invoice.creditNotes.length,
      Date: new Date(invoice.createdAt).toLocaleDateString("fr-FR"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factures");

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (format === "excel") {
      buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
      filename = `factures_${new Date().toISOString().split("T")[0]}.xlsx`;
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      buffer = Buffer.from(csv, "utf-8");
      filename = `factures_${new Date().toISOString().split("T")[0]}.csv`;
      contentType = "text/csv";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: `Erreur export: ${message}` }, { status: 500 });
  }
}
