import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const reasonLabels: Record<string, string> = {
  CANCELLATION: "Annulation",
  REFUND: "Remboursement",
  ERROR: "Erreur",
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const format = req.nextUrl.searchParams.get("format") || "csv";
    const reason = req.nextUrl.searchParams.get("reason");

    const where: Record<string, unknown> = {};
    if (reason && ["CANCELLATION", "REFUND", "ERROR"].includes(reason)) {
      where.reason = reason;
    }

    const creditNotes = await prisma.creditNote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        invoice: { select: { invoiceNumber: true } },
        order: {
          select: {
            orderNumber: true,
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const exportData = creditNotes.map((cn) => ({
      "N° Avoir": cn.creditNumber,
      "N° Commande": cn.order.orderNumber,
      "N° Facture": cn.invoice?.invoiceNumber || "-",
      Client: [cn.order.user.firstName, cn.order.user.lastName].filter(Boolean).join(" ") || cn.order.user.email,
      Montant: `${Number(cn.amount).toFixed(2)} €`,
      Motif: reasonLabels[cn.reason] || cn.reason,
      Date: new Date(cn.createdAt).toLocaleDateString("fr-FR"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Avoirs");

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (format === "excel") {
      buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
      filename = `avoirs_${new Date().toISOString().split("T")[0]}.xlsx`;
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      buffer = Buffer.from(csv, "utf-8");
      filename = `avoirs_${new Date().toISOString().split("T")[0]}.csv`;
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
