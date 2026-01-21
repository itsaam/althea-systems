import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { uploadLogger, LogMessages } from "@/lib/logger/exports";

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

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    // Limite de taille (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Maximum 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    uploadLogger.info(LogMessages.upload.debutUpload(file.name, file.size));
    
    const url = await uploadToR2(buffer, file.name, file.type, folder || undefined);
    
    uploadLogger.info(LogMessages.upload.uploadReussi(file.name));
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    uploadLogger.error(LogMessages.upload.uploadEchoue("unknown", message));
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

