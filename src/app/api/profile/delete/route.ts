import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/profile/delete
 * Droit a l'oubli (RGPD Art. 17) - Suppression du compte et de toutes les donnees personnelles
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Verifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      );
    }

    // Suppression en transaction pour garantir la coherence
    await prisma.$transaction(async (tx) => {
      // Anonymiser les commandes (obligation legale de conservation comptable)
      // On garde les commandes mais on anonymise les donnees personnelles
      await tx.order.updateMany({
        where: { userId },
        data: {
          notes: null,
        },
      });

      // Supprimer les backup codes 2FA
      await tx.backupCode.deleteMany({
        where: { userId },
      });

      // Supprimer les sessions
      await tx.session.deleteMany({
        where: { userId },
      });

      // Supprimer les comptes OAuth lies
      await tx.account.deleteMany({
        where: { userId },
      });

      // Supprimer les adresses
      await tx.address.deleteMany({
        where: { userId },
      });

      // Supprimer l'utilisateur (cascade sur les relations restantes)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      message:
        "Votre compte et toutes vos donnees personnelles ont ete supprimes conformement au RGPD (Art. 17).",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte", details: message },
      { status: 500 }
    );
  }
}
