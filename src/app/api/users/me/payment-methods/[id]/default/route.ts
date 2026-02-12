import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// PUT /api/users/me/payment-methods/[id]/default - Définir une carte comme défaut
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: paymentMethodId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Utilisateur ou client Stripe non trouvé" },
        { status: 404 }
      );
    }

    const paymentMethod = await stripe.instance.paymentMethods.retrieve(paymentMethodId);

    if (
      !paymentMethod ||
      (typeof paymentMethod.customer === "string" &&
        paymentMethod.customer !== user.stripeCustomerId)
    ) {
      return NextResponse.json(
        { error: "Moyen de paiement non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    await stripe.instance.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({
      message: "Carte définie comme défaut avec succès",
      paymentMethodId,
    });
  } catch (error) {
    console.error("❌ [SET-DEFAULT-PAYMENT-METHOD] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}