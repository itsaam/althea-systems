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
    const read = req.nextUrl.searchParams.get("read");

    const where: Record<string, unknown> = {};
    if (read === "true") where.read = true;
    if (read === "false") where.read = false;

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const exportData = messages.map((msg) => ({
      Nom: msg.name,
      Email: msg.email,
      Sujet: msg.subject,
      Message: msg.message,
      Lu: msg.read ? "Oui" : "Non",
      Date: new Date(msg.createdAt).toLocaleDateString("fr-FR"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (format === "excel") {
      buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
      filename = `messages_${new Date().toISOString().split("T")[0]}.xlsx`;
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      buffer = Buffer.from(csv, "utf-8");
      filename = `messages_${new Date().toISOString().split("T")[0]}.csv`;
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
