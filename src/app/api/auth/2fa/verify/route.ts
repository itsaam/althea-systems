import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { authenticator } from "otplib";

// POST - Vérifier le code 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { code, isSetup } = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Code invalide (6 chiffres requis)" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Si c'est la configuration initiale
    if (isSetup) {
      const pendingSecret = await redis.get(`2fa_setup:${user.id}`);

      if (!pendingSecret) {
        return NextResponse.json(
          { error: "Session de configuration expirée" },
          { status: 400 }
        );
      }

      // Vérifier le code TOTP
      const isValid = authenticator.verify({
        token: code,
        secret: pendingSecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
      }

      // Sauvegarder le secret 2FA dans la base
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorSecret: pendingSecret,
          twoFactorEnabled: true,
        },
      });

      // Supprimer le secret temporaire
      await redis.del(`2fa_setup:${user.id}`);

      return NextResponse.json({
        message: "2FA activé avec succès",
        enabled: true,
        updateSession: true, // Indique au client de mettre à jour la session
      });
    }

    // Vérification normale lors de la connexion
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA non configuré pour cet utilisateur" },
        { status: 400 }
      );
    }

    // Vérifier le code TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Vérification 2FA réussie",
      verified: true,
      updateSession: true, // Indique au client de mettre à jour la session
    });
  } catch (error) {
    console.error("Erreur 2FA verify:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
