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
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
        </div>
      </div>

      <div className="mt-8 lg:mt-0">
        <span className="text-eyebrow text-foreground/45 tabular-nums">
          {String(index + 1).padStart(2, "0")} / 03
          {product.categoryName ? ` · ${product.categoryName}` : ""}
        </span>
        <h3 className="mt-6 text-h1 text-foreground">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-6 max-w-md text-lead text-foreground/65">
            {product.description}
          </p>
        )}
        <p className="mt-10 font-mono text-sm uppercase tracking-[0.14em] tabular-nums text-foreground/80">
          {formatPrice(product.price)}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="group mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors duration-500 hover:border-electric-indigo-500 hover:text-electric-indigo-500"
        >
          Voir le produit
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
    <section className="relative bg-background py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <p className="text-eyebrow text-foreground/45">
                — Sélection · Produits signature
              </p>
            </ScrollReveal>
            <h2 className="mt-6 text-h1 text-foreground">
              <SplitText as="span" text="Produits" className="block" />
              <SplitText
                as="span"
                text="signature."
                delay={0.25}
                className="block text-foreground/40"
              />
            </h2>
          </div>
          <ScrollReveal delay={0.4} className="lg:col-span-5">
            <p className="max-w-md text-lead text-foreground/65">
              Des références soigneusement choisies par nos experts — pour les
              praticiens qui refusent le compromis.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:mt-32 lg:grid-cols-12 lg:gap-20">
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-24">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px] bg-muted">
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
                      <div className="absolute inset-0 bg-muted" />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-2">
                  {products.map((p, i) => (
                    <span
                      key={p.id}
                      className={`h-[2px] transition-all duration-700 ease-out ${
                        i === active
                          ? "w-10 bg-electric-indigo-500"
                          : "w-5 bg-foreground/20"
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
