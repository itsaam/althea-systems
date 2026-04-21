import { prisma } from "@/lib/prisma";
import HeroCarouselClient, { type CarouselSlide } from "./hero-carousel-client";

async function getSlides(): Promise<CarouselSlide[]> {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 3,
    });
    return slides.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      image: s.image,
      link: s.link,
    }));
  } catch {
    return [];
  }
}

export default async function HeroCarousel() {
  const slides = await getSlides();
  if (slides.length === 0) return null;
  return <HeroCarouselClient slides={slides} />;
}
