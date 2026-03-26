import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authLogger, LogMessages } from "@/lib/logger/exports";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validators/auth";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation with Zod
    const validatedData = registerSchema.parse(body);
    const { firstName, lastName, email, password } = validatedData;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      authLogger.warn(
        LogMessages.auth.inscriptionEchouee("Email déjà utilisé")
      );
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Générer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Sauvegarder le token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(email, verificationToken);
      authLogger.info(`Email de vérification envoyé à ${email}`);
    } catch (emailError) {
      authLogger.error(`Erreur envoi email: ${emailError}`);
      // On continue même si l'email échoue - l'utilisateur peut le renvoyer
    }

    authLogger.info(LogMessages.auth.inscriptionReussie(email));

    return NextResponse.json(
      {
        message: "Compte créé avec succès. Vérifiez votre email.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    authLogger.error(LogMessages.auth.inscriptionEchouee(message));

    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
