import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiLogger, loggedErrorResponse, loggedSuccessResponse } from "@/lib/logger/exports";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withApiLogger(async (req: NextRequest) => {
  try {

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") return loggedErrorResponse("Non autorisé", 403);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;
    const userId = searchParams.get("userId");
    const reason = searchParams.get("reason");

    const where: Record<string, unknown> = {};
    if (userId) where.order = { userId };
    if (reason && ["CANCELLATION", "REFUND", "ERROR"].includes(reason)) {
      where.reason = reason;
    }

    const [creditNotes, total] = await Promise.all([
      prisma.creditNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: { invoiceNumber: true, pdfUrl: true },
          },
          order: {
            select: {
              orderNumber: true,
              user: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.creditNote.count({ where }),
    ]);

    return loggedSuccessResponse({
      creditNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération avoirs: ${message}`, 500);
  }
});