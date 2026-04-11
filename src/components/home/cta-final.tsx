import ScrollReveal from "@/components/ui/scroll-reveal";
import { prisma } from "@/lib/prisma";
import CtaProductsCarousel, {
  type CarouselProduct,
} from "./cta-products-carousel";

async function getCarouselProducts(): Promise<CarouselProduct[]> {
  try {
    const featured = await prisma.product.findMany({
      where: { featured: true, status: "PUBLISHED" },
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      include: { category: true },
    });

    let products = featured;

    if (featured.length < 6) {
      const excludeIds = featured.map((p) => p.id);
      const fallback = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 6 - featured.length,
        include: { category: true },
      });
      products = [...featured, ...fallback];
    }

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
  const products = await getCarouselProducts();

  return (
    <>
      {/* ── Pinned horizontal products carousel ─────────────── */}
      {/* Must NOT be wrapped in a transformed / overflow-hidden parent,       */}
      {/* otherwise GSAP ScrollTrigger pin breaks. Rendered as a standalone    */}
      {/* sibling section so the pin anchors cleanly to the viewport.         */}
      {products.length > 0 && (
        <CtaProductsCarousel products={products} />
      )}

      {/* ── Bottom block : manifesto statement ───────────────── */}
      <section className="relative isolate grain overflow-hidden bg-background py-32 text-foreground md:py-48">
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 lg:px-10">
          <ScrollReveal>
            <h2 className="font-display text-h1 leading-[1.05] tracking-[-0.02em] text-foreground">
              Nous équipons ceux qui ne font
              <br className="hidden sm:block" />
              {" "}pas de compromis<span className="text-electric-indigo-500">.</span>
            </h2>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
