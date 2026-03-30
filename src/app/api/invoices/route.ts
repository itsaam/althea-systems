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
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status && ["PENDING", "PAID", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              orderNumber: true,
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
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return loggedSuccessResponse({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération factures: ${message}`, 500);
  }
});