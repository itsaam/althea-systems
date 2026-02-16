export const dynamic = 'force-dynamic'

import HeroCanvasReveal from "@/components/home/hero-canvas-reveal";
import CategoriesGrid from "@/components/home/categories-grid";
import FeaturedProducts from "@/components/home/featured-products";
import HomeText from "@/components/home/home-text";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Althea Systems - Équipement médical de pointe",
};

async function getCarouselSlides() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
      },
    });
    return slides;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const slides = await getCarouselSlides();
  
  return (
    <div className="flex flex-col">
      <HeroCanvasReveal initialSlides={slides} />
      <CategoriesGrid />
      <FeaturedProducts />
      <HomeText />
    </div>
  );
}
