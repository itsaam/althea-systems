import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { title, subtitle, image, link, order, active } = body;

    const slide = await prisma.carouselSlide.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image && { image }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
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
