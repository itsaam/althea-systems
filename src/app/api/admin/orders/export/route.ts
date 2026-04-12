import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateExport } from "@/lib/export";

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
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        items: true,
      },
    });

    const exportData = orders.map((order) => ({
      "N° Commande": order.orderNumber,
      Client: [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || order.user.email,
      Email: order.user.email,
      "Sous-total": `${Number(order.subtotal).toFixed(2)} €`,
      Livraison: `${Number(order.shippingCost).toFixed(2)} €`,
      TVA: `${Number(order.tax).toFixed(2)} €`,
      Total: `${Number(order.total).toFixed(2)} €`,
      Statut: order.status,
      Paiement: order.paymentStatus,
      Articles: order.items.length,
      Date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
    }));

    const { buffer, contentType, extension } = await generateExport(exportData, {
      format: format as "csv" | "excel",
      sheetName: "Commandes",
    });
    const filename = `commandes_${new Date().toISOString().split("T")[0]}.${extension}`;

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
