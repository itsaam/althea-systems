import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 3,
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error("Error fetching carousel:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, image, link, order, active } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: "Titre et image requis" },
        { status: 400 }
      );
    }

    // Vérifier qu'on n'a pas plus de 3 slides actifs
    const activeCount = await prisma.carouselSlide.count({
      where: { active: true },
    });

    if (activeCount >= 3 && active !== false) {
      return NextResponse.json(
        { error: "Maximum 3 slides actifs autorisés" },
        { status: 400 }
      );
    }

    const slide = await prisma.carouselSlide.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        order: order ?? activeCount,
        active: active ?? true,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("Error creating carousel slide:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
