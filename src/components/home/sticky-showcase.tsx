"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/split-text";
import ScrollReveal from "@/components/ui/scroll-reveal";

export type ShowcaseProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryName: string | null;
};

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductPanel({
  product,
  index,
  onEnter,
}: {
  product: ShowcaseProduct;
  index: number;
  onEnter: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px", once: false });

  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  return (
    <div
      ref={ref}
      className="flex min-h-[80vh] flex-col justify-center lg:min-h-screen"
    >
      <div className="lg:hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo-100 via-lavender-mist-100 to-shadow-grey-100" />
          )}
        </div>
      </div>

      <div className="mt-8 lg:mt-0">
        <span className="eyebrow text-lavender-mist-600">
          {String(index + 1).padStart(2, "0")}
          {product.categoryName ? ` · ${product.categoryName}` : ""}
        </span>
        <h3 className="font-display mt-6 text-4xl italic leading-[1] text-shadow-grey-900 md:text-5xl lg:text-6xl">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-6 max-w-md text-base leading-relaxed text-shadow-grey-600 md:text-lg">
            {product.description}
          </p>
        )}
        <p className="font-display mt-8 text-2xl italic text-electric-indigo-600">
          {formatPrice(product.price)}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="group mt-10 inline-flex items-center gap-2 border-b border-shadow-grey-900 pb-1 text-sm font-medium tracking-wide text-shadow-grey-900 transition-opacity duration-500 hover:opacity-70"
        >
          Voir le produit
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function StickyShowcase({
  products,
}: {
  products: ShowcaseProduct[];
}) {
  const [active, setActive] = useState(0);
  const current = products[active] ?? products[0];

  return (
    <section className="relative bg-shadow-grey-50 py-24 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-3xl">
          <ScrollReveal>
            <p className="eyebrow text-shadow-grey-500">Sélection</p>
          </ScrollReveal>
          <h2 className="font-display mt-6 text-display-sm text-shadow-grey-900">
            <SplitText as="span" text="Produits" className="block not-italic" />
            <SplitText
              as="span"
              text="signature."
              delay={0.3}
              className="block italic text-brand-gradient"
            />
          </h2>
          <ScrollReveal delay={0.5}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-shadow-grey-600">
              Des références soigneusement choisies par nos experts — pour les
              praticiens qui refusent le compromis.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:mt-32 lg:grid-cols-12 lg:gap-20">
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-24">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-shadow-grey-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current?.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {current?.image ? (
                      <Image
                        src={current.image}
                        alt={current.name}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                        priority={active === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo-100 via-lavender-mist-100 to-shadow-grey-100" />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-2">
                  {products.map((p, i) => (
                    <span
                      key={p.id}
                      className={`h-1 rounded-full transition-all duration-700 ease-out-expo ${
                        i === active
                          ? "w-10 bg-electric-indigo-600"
                          : "w-5 bg-shadow-grey-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-16 lg:col-span-6 lg:gap-0">
            {products.map((product, i) => (
              <ProductPanel
                key={product.id}
                product={product}
                index={i}
                onEnter={setActive}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
