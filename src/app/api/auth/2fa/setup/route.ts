import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { authenticator } from "otplib";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // Générer le secret 2FA avec otplib (format Base32 correct)
    const secret = authenticator.generateSecret();

    // Stocker temporairement dans Redis (expire en 10 minutes)
    await redis.set(`2fa_setup:${user.id}`, secret, "EX", 600);

    // Générer l'URL pour QR code avec otplib
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Althea Systems";
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);

    return NextResponse.json({
      secret,
      otpauthUrl,
      message: "Scannez le QR code avec votre application d'authentification",
    });
  } catch (error) {
    console.error("Erreur 2FA setup:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
