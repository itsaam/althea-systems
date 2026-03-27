import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import {
  productLogger,
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
} from "@/lib/logger/exports";

export const dynamic = 'force-dynamic';

const fileSchema = z.object({
  file: z.instanceof(Blob).refine((blob) => blob.size <= 5000000, "Max 5MB"),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withApiLogger(async (req: NextRequest, context: unknown) => {
  try {
    const { id } = await (context as RouteContext).params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return loggedErrorResponse(`Produit ${id} non trouvé`, 404);
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file");

    const validated = fileSchema.safeParse({ file: fileEntry });
    if (!validated.success) {
      return loggedErrorResponse(validated.error.issues[0].message, 400);
    }

    const file = fileEntry as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    const originalName = file.name || "image.jpg";
    const safeName = originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `${Date.now()}-${safeName}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/products/${filename}`;

    const product = await prisma.product.update({
      where: { id },
      data: {
        images: {
          push: imageUrl
        }
      },
      select: { id: true, images: true }
    });

    productLogger.info(`Image ${filename} ajoutée au produit ${id}`);

    return loggedSuccessResponse(
      { product, imageUrl },
      "Image ajoutée avec succès",
      201
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur upload: ${msg}`, 500);
  }
});