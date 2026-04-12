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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    const exportData = users.map((user) => ({
      Email: user.email,
      Prénom: user.firstName || "",
      Nom: user.lastName || "",
      Téléphone: user.phone || "",
      Rôle: user.role === "ADMIN" ? "Admin" : "Utilisateur",
      Statut: user.status,
      Commandes: user._count.orders,
      Inscription: new Date(user.createdAt).toLocaleDateString("fr-FR"),
    }));

    const { buffer, contentType, extension } = await generateExport(exportData, {
      format: format as "csv" | "excel",
      sheetName: "Utilisateurs",
    });
    const filename = `utilisateurs_${new Date().toISOString().split("T")[0]}.${extension}`;

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
