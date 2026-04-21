import ScrollReveal from "@/components/ui/scroll-reveal";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import CtaProductsCarousel, {
  type CarouselProduct,
} from "./cta-products-carousel";

async function getCarouselProducts(): Promise<CarouselProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, status: "PUBLISHED" },
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      include: { category: true },
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      image: p.images?.[0] ?? null,
      categoryName: p.category?.name ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function CtaFinal() {
  const [products, t] = await Promise.all([
    getCarouselProducts(),
    getTranslations("home.ctaFinal"),
  ]);

  return (
    <>
      {products.length > 0 && (
        <CtaProductsCarousel
          products={products}
          labels={{
            sectionLabel: t("signatureProducts"),
          }}
        />
      )}

      <section className="relative isolate grain overflow-hidden bg-background py-32 text-foreground md:py-48">
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 lg:px-10">
          <ScrollReveal>
            <h2 className="font-display text-h1 leading-[1.05] tracking-[-0.02em] text-foreground">
              {t("headline")}
              <span className="text-primary">.</span>
            </h2>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
