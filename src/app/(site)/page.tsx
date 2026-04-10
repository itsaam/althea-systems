export const dynamic = "force-dynamic";

import Hero from "@/components/home/hero";
import Ticker from "@/components/home/ticker";
import CategoriesGrid from "@/components/home/categories-grid";
import FeaturedProducts from "@/components/home/featured-products";
import WhyAlthea from "@/components/home/why-althea";
import StatsBand from "@/components/home/stats-band";
import CtaFinal from "@/components/home/cta-final";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Althea Systems — Équipement médical de pointe",
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
      <Hero slides={slides} />
      <Ticker />
      <CategoriesGrid />
      <FeaturedProducts />
      <WhyAlthea />
      <StatsBand />
      <CtaFinal />
    </div>
  );
}
