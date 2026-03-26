import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carouselSlideSchema } from "@/lib/validators/common";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slide = await prisma.carouselSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return NextResponse.json({ error: "Slide non trouvé" }, { status: 404 });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error fetching carousel slide:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = carouselSlideSchema.partial().parse(body);

    const slide = await prisma.carouselSlide.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.subtitle !== undefined && { subtitle: validatedData.subtitle }),
        ...(validatedData.image && { image: validatedData.image }),
        ...(validatedData.link !== undefined && { link: validatedData.link }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.active !== undefined && { active: validatedData.active }),
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating carousel slide:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.carouselSlide.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Slide supprimé" });
  } catch (error) {
    console.error("Error deleting carousel slide:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
