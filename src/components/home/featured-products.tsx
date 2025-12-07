"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          // Handle both array and object responses
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (isLoading) {
    return (
      <section className="w-full py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full py-16 bg-[#d4f4f7]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#003d5c]">
              Les Top Produits du moment
            </h2>
            <p className="mt-2 text-muted-foreground">
              Les équipements les plus demandés par nos clients
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00a8b5] hover:text-[#33bfc9] transition-colors"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              {/* Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Discount badge */}
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black text-white text-xs font-medium">
                      -
                      {Math.round(
                        ((product.compareAtPrice - product.price) /
                          product.compareAtPrice) *
                          100
                      )}
                      %
                    </div>
                  )}

                {/* Quick add button */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                {product.category && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {product.category.name}
                  </p>
                )}
                <h3 className="font-medium text-sm md:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatPrice(product.price)}</p>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-10 md:hidden text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tous les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
