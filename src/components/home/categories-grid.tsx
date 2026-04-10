"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Stethoscope,
  HeartPulse,
  Syringe,
  Microscope,
  Pill,
  Scissors,
  Activity,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./categories-grid.module.css";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  _count?: { products: number };
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  diagnostic: Stethoscope,
  cardio: HeartPulse,
  cardiologie: HeartPulse,
  injection: Syringe,
  seringue: Syringe,
  laboratoire: Microscope,
  analyse: Microscope,
  medicament: Pill,
  pharmacie: Pill,
  chirurgie: Scissors,
  monitoring: Activity,
  consommable: Package,
};

function pickIcon(slug: string): LucideIcon {
  const key = Object.keys(CATEGORY_ICONS).find((k) => slug.toLowerCase().includes(k));
  return key ? CATEGORY_ICONS[key] : Stethoscope;
}

function getImage(category: Category): string | undefined {
  return category.imageUrl || category.image;
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
          const items: Category[] = Array.isArray(data) ? data : data.categories || [];
          setCategories(items.slice(0, 5));
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
    return <CategoriesGridSkeleton />;
  }

  if (categories.length === 0) return null;

  const [feature, ...secondary] = categories;

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(0,168,181,0.08),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 md:mb-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#00a8b5] mb-3 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[#00a8b5]" aria-hidden="true" />
              Catalogue
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#003d5c] leading-[0.95]">
              Un équipement
              <br />
              <span className="italic font-normal text-[#00a8b5]">pour chaque geste</span>{" "}
              médical.
            </h2>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <p className="text-sm text-muted-foreground max-w-xs mb-4 leading-relaxed">
              De la consultation au bloc, parcourez les catégories qui structurent
              notre sélection.
            </p>
            <Link
              href="/categories"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#003d5c] hover:text-[#00a8b5] transition-colors"
            >
              <span className="border-b border-[#003d5c] group-hover:border-[#00a8b5] transition-colors pb-0.5">
                Voir tout le catalogue
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5">
          {feature && (
            <FeatureCard category={feature} position={0} />
          )}
          {secondary.map((cat, idx) => (
            <SecondaryCard key={cat.id} category={cat} position={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ category, position }: { category: Category; position: number }) {
  const Icon = pickIcon(category.slug);
  const image = getImage(category);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative md:col-span-6 lg:col-span-7 lg:row-span-2 min-h-[420px] lg:min-h-[560px] rounded-3xl overflow-hidden bg-[#003d5c] text-white isolate ${styles.rise}`}
      style={{ animationDelay: `${position * 80}ms` }}
    >
      {image ? (
        <div
          role="img"
          aria-label={category.name}
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,168,181,0.35),_transparent_60%),linear-gradient(135deg,_#003d5c,_#001f2e)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#001f2e]/95 via-[#001f2e]/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-10">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 border border-white/25 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00a8b5]" aria-hidden="true" />
            Sélection phare
          </span>
          <span
            aria-hidden="true"
            className="h-12 w-12 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:border-white group-hover:rotate-45"
          >
            <ArrowUpRight className="h-5 w-5 text-white group-hover:text-[#003d5c] transition-colors" />
          </span>
        </div>

        <div>
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-5"
          >
            <Icon className="h-6 w-6 text-white" />
          </span>
          <h3 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] max-w-[14ch]">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-4 text-sm md:text-base text-white/75 max-w-md leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-white/60">
            {category._count?.products !== undefined && (
              <span>{category._count.products} référence{category._count.products > 1 ? "s" : ""}</span>
            )}
            <span className="h-px flex-1 max-w-[120px] bg-white/20" aria-hidden="true" />
            <span className="opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              Explorer →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SecondaryCard({ category, position }: { category: Category; position: number }) {
  const Icon = pickIcon(category.slug);
  const image = getImage(category);

  const spanClass =
    position === 1
      ? "md:col-span-3 lg:col-span-5 min-h-[260px]"
      : position === 2
        ? "md:col-span-3 lg:col-span-5 min-h-[260px]"
        : "md:col-span-3 lg:col-span-6 min-h-[220px]";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative ${spanClass} rounded-3xl overflow-hidden bg-white border border-[#003d5c]/10 hover:border-[#00a8b5]/40 transition-colors duration-300 isolate ${styles.rise}`}
      style={{ animationDelay: `${position * 80}ms` }}
    >
      {image && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003d5c]/85 via-[#003d5c]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </>
      )}

      <div className="relative h-full flex flex-col justify-between p-6 md:p-7">
        <div className="flex items-start justify-between">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-[#003d5c]/5 border border-[#003d5c]/10 text-[#003d5c] group-hover:bg-white group-hover:text-[#003d5c] group-hover:border-white transition-all duration-500"
          >
            <Icon className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-[#003d5c]/40 group-hover:text-white transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-[#003d5c] group-hover:text-white transition-colors duration-500 leading-tight">
            {category.name}
          </h3>
          {category._count?.products !== undefined && (
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#003d5c]/55 group-hover:text-white/75 transition-colors duration-500">
              {category._count.products} produit{category._count.products > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategoriesGridSkeleton() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 h-24 w-2/3 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5">
          <div className="md:col-span-6 lg:col-span-7 lg:row-span-2 min-h-[420px] lg:min-h-[560px] rounded-3xl bg-muted animate-pulse" />
          <div className="md:col-span-3 lg:col-span-5 min-h-[260px] rounded-3xl bg-muted animate-pulse" />
          <div className="md:col-span-3 lg:col-span-5 min-h-[260px] rounded-3xl bg-muted animate-pulse" />
          <div className="md:col-span-3 lg:col-span-6 min-h-[220px] rounded-3xl bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  );
}
