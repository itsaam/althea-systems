import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profile/export
 * Droit a la portabilite (RGPD Art. 20) - Export de toutes les donnees personnelles en JSON
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            street: true,
            street2: true,
            city: true,
            region: true,
            postalCode: true,
            country: true,
            phone: true,
            isDefault: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            subtotal: true,
            shippingCost: true,
            tax: true,
            total: true,
            createdAt: true,
            items: {
              select: {
                name: true,
                price: true,
                quantity: true,
              },
            },
          },
        },
        sessions: {
          select: {
            id: true,
            expires: true,
          },
        },
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      );
    }

    const exportData = {
      _meta: {
        exportDate: new Date().toISOString(),
        format: "RGPD-compliant personal data export",
        regulation: "RGPD Art. 20 - Droit a la portabilite",
        controller: "Althea Systems",
        contactDpo: "dpo@vjuya.me",
      },
      personalData: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        accountCreated: user.createdAt,
        lastUpdated: user.updatedAt,
      },
      addresses: user.addresses,
      orders: user.orders.map((order) => ({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal.toString(),
        shippingCost: order.shippingCost.toString(),
        tax: order.tax.toString(),
        total: order.total.toString(),
        date: order.createdAt,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price.toString(),
          quantity: item.quantity,
        })),
      })),
      connectedAccounts: user.accounts.map((account) => ({
        provider: account.provider,
        type: account.type,
      })),
      activeSessions: user.sessions.length,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="althea-data-export-${userId}.json"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur lors de l'export des donnees", details: message },
      { status: 500 }
    );
  }
}
