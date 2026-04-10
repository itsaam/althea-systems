import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { R2_FOLDERS, type R2Folder } from "@/lib/r2";
import { validateOptimizeAndUpload } from "@/lib/image-optimization";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    if (folder && !R2_FOLDERS.includes(folder as R2Folder)) {
      return NextResponse.json(
        {
          error: `Dossier invalide. Valeurs acceptees: ${R2_FOLDERS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validFolder = folder ? (folder as R2Folder) : undefined;

    const result = await validateOptimizeAndUpload(
      buffer,
      file.name,
      validFolder
    );

    return NextResponse.json({
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      width: result.width,
      height: result.height,
      size: result.size,
      contentType: "image/webp",
      folder: folder || null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    const isValidation =
      message.includes("vide") ||
      message.includes("volumineux") ||
      message.includes("non reconnu") ||
      message.includes("invalide");
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}
