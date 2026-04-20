import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

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

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "ESCALATED", "CLOSED"]),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: loggedErrorResponse("Non authentifié", 401) };
  }
  if (session.user?.role !== "ADMIN") {
    apiLogger.warn(LogMessages.auth.nonAutorise);
    return { error: loggedErrorResponse("Non autorisé", 403) };
  }
  return { session };
}

export const GET = withApiLogger(async (_req: NextRequest, context) => {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await (context as RouteContext).params;

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return loggedErrorResponse("Conversation introuvable", 404);
    }

    return loggedSuccessResponse({
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        status: conversation.status,
        userId: conversation.userId,
        userEmail: conversation.userEmail ?? conversation.user?.email ?? null,
        userName: conversation.user?.name ?? null,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(
      `Erreur récupération conversation : ${message}`,
      500
    );
  }
});

export const PATCH = withApiLogger(async (req: NextRequest, context) => {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await (context as RouteContext).params;
    const body = await req.json();
    const { status } = patchSchema.parse(body);

    const existing = await prisma.chatbotConversation.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) {
      return loggedErrorResponse("Conversation introuvable", 404);
    }

    const updated = await prisma.chatbotConversation.update({
      where: { id },
      data: { status },
    });

    apiLogger.info("Chatbot conversation status updated", {
      conversationId: id,
      from: existing.status,
      to: status,
      by: session?.user?.id,
    });

    return loggedSuccessResponse(
      {
        conversation: {
          id: updated.id,
          status: updated.status,
          updatedAt: updated.updatedAt.toISOString(),
        },
      },
      `Conversation ${id} → ${status}`
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse("Statut invalide", 400);
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(
      `Erreur mise à jour conversation : ${message}`,
      500
    );
  }
});
