import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
} from "@/lib/logger/exports";

// Validation pour mise à jour d'un CreditNote
const updateCreditSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.enum(["CANCELLATION", "REFUND", "ERROR"]).optional(),
  invoiceId: z.string().nullable().optional(),
});

interface Params {
  id: string;
}

// GET CreditNote par id
export const GET = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const { id } = (context as { params: Params }).params;

    const credit = await prisma.creditNote.findUnique({
      where: { id },
      include: {
        order: true,
        invoice: true,
      },
    });

    if (!credit) return loggedErrorResponse("CreditNote non trouvé", 404);

    return loggedSuccessResponse({ credit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur récupération CreditNote: ${message}`, 500);
  }
});

// PATCH CreditNote
export const PATCH = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = (context as { params: Params }).params;
    const body = await req.json();

    const validatedData = updateCreditSchema.parse(body);

    const existingCredit = await prisma.creditNote.findUnique({ where: { id } });
    if (!existingCredit) return loggedErrorResponse("CreditNote non trouvé", 404);

    const credit = await prisma.creditNote.update({
      where: { id },
      data: validatedData,
      include: { order: true, invoice: true },
    });

    return loggedSuccessResponse({ credit }, "CreditNote mis à jour avec succès");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map(i => i.message).join(", ")}`,
        400
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur mise à jour CreditNote: ${message}`, 500);
  }
});

// DELETE CreditNote
export const DELETE = withApiLogger(async (req: NextRequest, context?: unknown) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Non autorisé", 403);
    }

    const { id } = (context as { params: Params }).params;

    const credit = await prisma.creditNote.findUnique({
      where: { id },
    });

    if (!credit) return loggedErrorResponse("CreditNote non trouvé", 404);

    await prisma.creditNote.delete({ where: { id } });
    return loggedSuccessResponse({ message: "CreditNote supprimé avec succès" }, "CreditNote supprimé");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur suppression CreditNote: ${message}`, 500);
  }
});
