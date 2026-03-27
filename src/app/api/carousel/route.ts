export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carouselSlideSchema } from "@/lib/validators/common";
import { z } from "zod";

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
    const validatedData = carouselSlideSchema.parse(body);

    // Vérifier qu'on n'a pas plus de 3 slides actifs
    const activeCount = await prisma.carouselSlide.count({
      where: { active: true },
    });

    if (activeCount >= 3 && validatedData.active !== false) {
      return NextResponse.json(
        { error: "Maximum 3 slides actifs autorisés" },
        { status: 400 }
      );
    }

    const slide = await prisma.carouselSlide.create({
      data: {
        title: validatedData.title,
        subtitle: validatedData.subtitle || null,
        image: validatedData.image,
        link: validatedData.link || null,
        order: validatedData.order ?? activeCount,
        active: validatedData.active ?? true,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating carousel slide:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
