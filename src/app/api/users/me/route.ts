import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { hash } from "bcryptjs";
import { z } from "zod";
import { getUserCurrency } from "@/lib/currency";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  currentPassword: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const currency = await getUserCurrency(userId, prisma);
    console.log(`💱 [USER-PROFILE] Detected currency: ${currency.toUpperCase()}`);

    let paymentMethods: Array<{
      id: string;
      brand?: string;
      last4?: string;
      expMonth?: number;
      expYear?: number;
      isDefault: boolean;
    }> = [];
    let defaultPaymentMethodId: string | null = null;

    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.instance.customers.retrieve(user.stripeCustomerId);
        
        if (customer && !customer.deleted) {
          defaultPaymentMethodId = 
            typeof customer.invoice_settings?.default_payment_method === "string"
              ? customer.invoice_settings.default_payment_method
              : customer.invoice_settings?.default_payment_method?.id || null;

          const methods = await stripe.instance.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: "card",
          });

          paymentMethods = methods.data.map((pm) => ({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            expMonth: pm.card?.exp_month,
            expYear: pm.card?.exp_year,
            isDefault: pm.id === defaultPaymentMethodId,
          }));
        }
      } catch (error) {
        console.error("❌ [USER-PROFILE] Error fetching payment methods:", error);
      }
    }

    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      ...userWithoutPassword,
      paymentMethods,
      currency: currency,
    });
  } catch (error) {
    console.error("❌ [USER-PROFILE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const validatedData = updateProfileSchema.parse(body);

    if (validatedData.password) {
      if (!validatedData.currentPassword) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est requis" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      const { compare } = await import("bcryptjs");
      const isValid = await compare(validatedData.currentPassword, user.password);

      if (!isValid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      password?: string;
    } = {};

    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.password) {
      updateData.password = await hash(validatedData.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("❌ [UPDATE-PROFILE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}