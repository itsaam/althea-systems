import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  apiLogger,
  LogMessages,
} from "@/lib/logger/exports";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(["ACTIVE", "ESCALATED", "CLOSED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "status"])
    .optional()
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return loggedErrorResponse("Non authentifié", 401);
    }
    if (session.user?.role !== "ADMIN") {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return loggedErrorResponse("Non autorisé", 403);
    }

    const params = querySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );

    const where: Prisma.ChatbotConversationWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const orderBy: Prisma.ChatbotConversationOrderByWithRelationInput = {
      [params.sortBy]: params.sortOrder,
    };

    const skip = (params.page - 1) * params.limit;

    const [conversations, total] = await Promise.all([
      prisma.chatbotConversation.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        include: {
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true, role: true, content: true },
          },
        },
      }),
      prisma.chatbotConversation.count({ where }),
    ]);

    const data = conversations.map((c) => {
      const last = c.messages[0];
      return {
        id: c.id,
        sessionId: c.sessionId,
        status: c.status,
        userId: c.userId,
        userEmail: c.userEmail ?? c.user?.email ?? null,
        userName: c.user?.name ?? null,
        messageCount: c._count.messages,
        lastMessageAt: last?.createdAt.toISOString() ?? c.updatedAt.toISOString(),
        lastMessagePreview: last
          ? last.content.slice(0, 140)
          : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return loggedSuccessResponse({
      conversations: data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse("Paramètres invalides", 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(
      `Erreur récupération conversations chatbot : ${message}`,
      500
    );
  }
});
