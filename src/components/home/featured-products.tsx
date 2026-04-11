import { prisma } from "@/lib/prisma";
import StickyShowcase, { type ShowcaseProduct } from "./sticky-showcase";

export default async function FeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
      include: { category: true },
    });

    if (products.length === 0) return null;

    const payload: ShowcaseProduct[] = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      image: p.images?.[0] ?? null,
      categoryName: p.category?.name ?? null,
    }));

    return <StickyShowcase products={payload} />;
  } catch {
    return null;
  }
}
