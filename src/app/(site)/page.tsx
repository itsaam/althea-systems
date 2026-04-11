import Hero from "@/components/home/hero";
import Ticker from "@/components/home/ticker";
import FeaturedProducts from "@/components/home/featured-products";
import CategoriesGrid from "@/components/home/categories-grid";
import CtaFinal from "@/components/home/cta-final";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Althea Systems — Équipement médical de pointe",
};

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Ticker />
      <FeaturedProducts />
      <CategoriesGrid />
      <CtaFinal />
    </div>
  );
}
