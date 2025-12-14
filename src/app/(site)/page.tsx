import HeroCanvasReveal from "@/components/home/hero-canvas-reveal";
import CategoriesGrid from "@/components/home/categories-grid";
import FeaturedProducts from "@/components/home/featured-products";
import HomeText from "@/components/home/home-text";

export const metadata = {
  title: "Althea Systems - Équipement médical de pointe",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroCanvasReveal />
      <CategoriesGrid />
      <FeaturedProducts />
      <HomeText />
    </div>
  );
}
