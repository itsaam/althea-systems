"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  images?: { url: string; alt?: string }[];
  category?: { name: string };
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/featured");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];
          setProducts(items.slice(0, 8));
        }
      } catch {
        // API not available or DB not connected - silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  if (isLoading) {
    return (
      <section className="w-full bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-shadow-grey-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-shadow-grey-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-shadow-grey-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative w-full bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header */}
        <div className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Sélection du moment</p>
            <h2 className="font-display mt-6 text-display-sm text-shadow-grey-900">
              Ce que les pros
              <br />
              <em className="not-italic italic text-brand-gradient">
                commandent cette semaine.
              </em>
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 self-start rounded-full border border-shadow-grey-300 bg-transparent px-6 py-3 text-sm font-medium text-shadow-grey-900 transition-all duration-500 ease-out-expo hover:border-shadow-grey-900 hover:bg-shadow-grey-900 hover:text-white md:self-auto"
          >
            Tout le catalogue
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-4 md:gap-x-8 md:gap-y-24">
          {products.map((product, idx) => {
            // Introduce subtle vertical stagger on alternate cards
            const offsetClass = idx % 2 === 1 ? "md:mt-12" : "";
            const hasDiscount =
              product.compareAtPrice && product.compareAtPrice > product.price;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`group flex flex-col ${offsetClass}`}
              >
                {/* Image frame */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-shadow-grey-100">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-shadow-grey-100 to-lavender-mist-50">
                      <ShoppingBag className="h-12 w-12 text-shadow-grey-400" />
                    </div>
                  )}

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute left-4 top-4 rounded-full bg-electric-indigo-500 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                      −
                      {Math.round(
                        ((product.compareAtPrice! - product.price) /
                          product.compareAtPrice!) *
                          100
                      )}
                      %
                    </div>
                  )}

                  {/* Quick-look CTA — slides in from bottom on hover */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex items-center justify-between rounded-full border border-white/20 bg-shadow-grey-900/80 px-5 py-3 backdrop-blur-xl">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white">
                        Voir la fiche
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 flex flex-col gap-2">
                  {product.category && (
                    <p className="eyebrow text-shadow-grey-500">
                      {product.category.name}
                    </p>
                  )}
                  <h3 className="line-clamp-2 text-base font-medium leading-snug text-shadow-grey-900 transition-colors duration-300 group-hover:text-electric-indigo-600 md:text-lg">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-3">
                    <p className="font-display text-xl italic text-shadow-grey-900">
                      {formatPrice(product.price)}
                    </p>
                    {hasDiscount && (
                      <p className="text-sm text-shadow-grey-400 line-through">
                        {formatPrice(product.compareAtPrice!)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
