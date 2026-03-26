import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { forgotPasswordApiSchema } from "@/lib/validators/common";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordApiSchema.parse(body);

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Toujours retourner succès pour éviter l'énumération d'emails
    if (!user) {
      return NextResponse.json({
        message:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
      });
    }

    // Supprimer les anciens tokens de reset pour cet utilisateur
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: `reset_${email}`,
      },
    });

    // Générer un nouveau token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.verificationToken.create({
      data: {
        identifier: `reset_${email}`,
        token: resetToken,
        expires,
      },
    });

    // Envoyer l'email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
