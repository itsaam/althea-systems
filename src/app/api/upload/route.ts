import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { R2_FOLDERS, type R2Folder } from "@/lib/r2";
import { uploadLogger, LogMessages } from "@/lib/logger/exports";
import { validateOptimizeAndUpload } from "@/lib/image-optimization";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const currentImagesCount = formData.get("currentImagesCount") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    // Vérification limite 10 images
    const count = parseInt(currentImagesCount || "0", 10);
    if (count >= 10) {
      uploadLogger.warn(`Tentative d'upload au-delà de la limite (${count} images)`);
      return NextResponse.json(
        { error: "Limite de 10 images atteinte" },
        { status: 400 }
      );
    }

    const validFolder =
      folder && R2_FOLDERS.includes(folder as R2Folder)
        ? (folder as R2Folder)
        : undefined;

    const buffer = Buffer.from(await file.arrayBuffer());
    uploadLogger.info(LogMessages.upload.debutUpload(file.name, file.size));

    const result = await validateOptimizeAndUpload(
      buffer,
      file.name,
      validFolder
    );

    uploadLogger.info(LogMessages.upload.uploadReussi(file.name));
    return NextResponse.json({
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      width: result.width,
      height: result.height,
      size: result.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    uploadLogger.error(LogMessages.upload.uploadEchoue("unknown", message));
    const isValidation =
      message.includes("vide") ||
      message.includes("volumineux") ||
      message.includes("non reconnu") ||
      message.includes("invalide");
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}
