import { prisma } from "@/lib/prisma";
import HorizontalCategories, {
  type HorizontalCategory,
} from "./horizontal-categories";

export default async function CategoriesGrid() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 8,
    });

    if (categories.length === 0) return null;

    const payload: HorizontalCategory[] = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image,
    }));

    return <HorizontalCategories categories={payload} />;
  } catch {
    return null;
  }
}
