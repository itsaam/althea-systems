"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          // Handle both array and object responses
          const items = Array.isArray(data) ? data : data.categories || [];
          setCategories(items.slice(0, 4));
        }
      } catch {
        // API not available or DB not connected - silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="w-full py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#003d5c]">
              Nos catégories
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explorez notre gamme d&apos;équipements médicaux
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted"
            >
              {/* Background */}
              {category.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${category.imageUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-semibold text-white">
                  {category.name}
                </h3>
                {category._count?.products !== undefined && (
                  <p className="mt-1 text-sm text-white/70">
                    {category._count.products} produit
                    {category._count.products > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir toutes les catégories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
