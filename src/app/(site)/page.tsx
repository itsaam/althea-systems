import Hero from "@/components/home/hero";
import HeroCarousel from "@/components/home/hero-carousel";
import Ticker from "@/components/home/ticker";
import CtaFinal from "@/components/home/cta-final";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Althea Systems — Équipement médical de pointe",
};

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <HeroCarousel />
      <Ticker />
      <CtaFinal />
    </div>
  );
}
