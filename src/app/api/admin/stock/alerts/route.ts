import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STOCK_MIN_THRESHOLD = 5; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const outOfStock = await prisma.product.findMany({
      where: { 
        stock: 0,
        status: "PUBLISHED", 
      },
      include: {
        category: {
          select: { 
            id: true, 
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const lowStock = await prisma.product.findMany({
      where: {
        stock: { 
          gt: 0, 
          lt: STOCK_MIN_THRESHOLD,
        },
        status: "PUBLISHED",
      },
      include: {
        category: {
          select: { 
            id: true, 
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        stock: "asc", 
      },
    });

    const serializedOutOfStock = outOfStock.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    }));

    const serializedLowStock = lowStock.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice?.toNumber() || null,
      image: product.images[0] || null,
    }));

    return NextResponse.json({
      threshold: STOCK_MIN_THRESHOLD,
      outOfStock: serializedOutOfStock.length,
      lowStock: serializedLowStock.length,
      products: {
        outOfStock: serializedOutOfStock,
        lowStock: serializedLowStock,
      },
    });
  } catch (error) {
    console.error("❌ [STOCK ALERTS] Erreur récupération alertes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes stock" },
      { status: 500 }
    );
  }
}