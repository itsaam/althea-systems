import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getFeatured() {
  try {
    return await prisma.product.findMany({
      where: { featured: true },
      orderBy: [{ featuredOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
      include: { category: true },
    });
  } catch {
    return null;
  }
}

function formatPrice(value: unknown) {
  const num = typeof value === "object" && value !== null ? Number(value.toString()) : Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

type FeaturedProduct = NonNullable<Awaited<ReturnType<typeof getFeatured>>>[number];

function ProductCard({
  product,
  aspect,
}: {
  product: FeaturedProduct;
  aspect: "4/5" | "16/10";
}) {
  const image = product.images?.[0];
  const aspectClass = aspect === "4/5" ? "aspect-[4/5]" : "aspect-[16/10]";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block overflow-hidden rounded-3xl"
    >
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-3xl`}>
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-shadow-grey-200 via-shadow-grey-100 to-lavender-mist-100" />
        )}
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-shadow-grey-900/70 p-6 backdrop-blur-xl">
        {product.category?.name && (
          <p className="eyebrow text-lavender-mist-300">{product.category.name}</p>
        )}
        <h3 className="font-display mt-2 text-xl italic text-white md:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-white/80">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default async function FeaturedProducts() {
  const products = await getFeatured();
  if (!products || products.length === 0) return null;

  const [first, ...rest] = products;

  return (
    <section className="bg-background py-24 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <p className="eyebrow text-shadow-grey-500">Sélection</p>
          <h2 className="font-display mt-6 text-display-sm italic text-shadow-grey-900">
            Produits <em className="text-brand-gradient">signature</em>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-shadow-grey-600">
            Des références soigneusement choisies par nos experts.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ProductCard product={first} aspect="4/5" />
          </div>
          {rest.length > 0 && (
            <div className="flex flex-col gap-8 lg:col-span-5">
              {rest.map((p) => (
                <ProductCard key={p.id} product={p} aspect="16/10" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
