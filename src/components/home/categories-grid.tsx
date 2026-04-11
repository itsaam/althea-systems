import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 6,
    });
  } catch {
    return null;
  }
}

export default async function CategoriesGrid() {
  const categories = await getCategories();
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-shadow-grey-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <p className="eyebrow text-shadow-grey-500">Explorer</p>
          <h2 className="font-display mt-6 text-display-sm italic text-shadow-grey-900">
            Par <em className="text-brand-gradient">spécialité</em>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-shadow-grey-600">
            Un catalogue organisé par domaine pour aller droit à l&apos;essentiel.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-shadow-grey-200 via-shadow-grey-100 to-lavender-mist-100" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-shadow-grey-950/80 via-shadow-grey-950/20 to-transparent" />

              <div className="absolute inset-x-5 bottom-5">
                <h3 className="font-display text-2xl italic text-white">
                  {category.name}
                </h3>
                <p className="eyebrow mt-2 text-white/70">Explorer →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
