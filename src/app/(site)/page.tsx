import HeroCarousel from "@/components/home/hero-carousel";
import CategoriesGrid from "@/components/home/categories-grid";
import FeaturedProducts from "@/components/home/featured-products";
import HomeText from "@/components/home/home-text";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 py-8">
      <HeroCarousel />
      <CategoriesGrid />
      <FeaturedProducts />
      <HomeText />
    </div>
  );
}
