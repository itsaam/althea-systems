import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import * as XLSX from "xlsx";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withApiLogger, loggedErrorResponse } from "@/lib/logger/exports";
import { productLogger, apiLogger, LogMessages } from "@/lib/logger/exports";
import { calculateTTC, formatTVA } from "@/lib/utils/tva";
import { querySchema } from "../route";

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    // Vérification authentification admin
    const session = await getServerSession(authOptions);
    if (!session) {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      apiLogger.warn(LogMessages.auth.nonAutorise);
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupération du format d'export
    const format = req.nextUrl.searchParams.get("format") || "csv";
    if (format !== "csv" && format !== "excel") {
      return NextResponse.json({ error: "Format invalide. Utilisez csv ou excel" }, { status: 400 });
    }

    // Validation des filtres avec le schema partagé
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validatedParams = querySchema.parse(searchParams);

    const {
      search,
      categoryIds: categoryIdsParam,
      minPrice,
      maxPrice,
      inStock,
      status,
      startDate,
      endDate,
    } = validatedParams;

    // Parse categoryIds (comma-separated)
    const categoryIds = categoryIdsParam?.split(",").filter(Boolean);

    // Construction des filtres Prisma
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (inStock !== undefined) {
      if (inStock === "true") {
        where.stock = { gt: 0 };
      } else if (inStock === "false") {
        where.stock = { equals: 0 };
      }
    }

    if (status && (status === "DRAFT" || status === "PUBLISHED")) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Récupération de tous les produits correspondant aux filtres
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Préparation des données pour l'export
    const exportData = products.map((product) => {
      const priceHT = product.price.toNumber();
      const priceTTC = calculateTTC(priceHT, product.tva);

      return {
        Nom: product.name,
        Description: product.description || "",
        Catégorie: product.category?.name || "Sans catégorie",
        "Prix HT": `${priceHT.toFixed(2)} €`,
        TVA: formatTVA(product.tva),
        "Prix TTC": `${priceTTC.toFixed(2)} €`,
        Stock: product.stock,
        Statut: product.status === "PUBLISHED" ? "Publié" : "Brouillon",
        "Date création": new Date(product.createdAt).toLocaleDateString("fr-FR"),
      };
    });

    // Création du workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");

    // Génération du fichier
    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (format === "excel") {
      buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
      filename = `produits_${new Date().toISOString().split("T")[0]}.xlsx`;
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      // CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      buffer = Buffer.from(csv, "utf-8");
      filename = `produits_${new Date().toISOString().split("T")[0]}.csv`;
      contentType = "text/csv";
    }

    productLogger.info(
      LogMessages.admin.exportGenere(`${format.toUpperCase()} - ${products.length} produits`)
    );

    // Retour du fichier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiLogger.warn(LogMessages.api.erreurValidation(error.message));
      return loggedErrorResponse("Paramètres invalides", 400);
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    productLogger.error(`Erreur export produits : ${message}`);
    return NextResponse.json({ error: `Erreur lors de l'export : ${message}` }, { status: 500 });
  }
});
