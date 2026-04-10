import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
  productLogger,
  apiLogger,
  LogMessages,
} from "@/lib/logger/exports";
import { invalidateProductCache } from "@/lib/redis";

const bodySchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, "Au moins un identifiant est requis")
    .max(200, "Trop d'identifiants (max 200)"),
});

export const PATCH = withApiLogger(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (session.user?.role !== "ADMIN") {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return loggedErrorResponse(
        `Corps de requête invalide: ${parsed.error.issues
          .map((i) => `${i.path.join(".")} ${i.message}`)
          .join(", ")}`,
        400
      );
    }

    const { ids } = parsed.data;

    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length !== ids.length) {
      return loggedErrorResponse(
        "La liste d'identifiants contient des doublons",
        400
      );
    }

    const existing = await prisma.product.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length !== uniqueIds.length) {
      const found = new Set(existing.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      return loggedErrorResponse(
        `Produits introuvables: ${missing.join(", ")}`,
        404
      );
    }

    await prisma.$transaction(
      uniqueIds.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { featuredOrder: index, featured: true },
        })
      )
    );

    await invalidateProductCache().catch((err) => {
      productLogger.warn(
        `Invalidation cache produits échouée: ${
          err instanceof Error ? err.message : "inconnue"
        }`
      );
    });

    productLogger.info(
      `Ordre des produits mis en avant mis à jour (${uniqueIds.length} produits)`
    );

    return loggedSuccessResponse(
      { updated: uniqueIds.length, ids: uniqueIds },
      "Ordre des produits mis en avant mis à jour"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur réordonnancement produits mis en avant: ${message}`);
    return loggedErrorResponse(
      `Erreur réordonnancement produits mis en avant: ${message}`,
      500
    );
  }
});
