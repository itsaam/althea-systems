"use client";

import Link from "next/link";
import Image from "next/image";
import StockBadge from "@/components/products/stock-badge";
import AddToCartButton from "@/components/cart/add-to-cart-button";

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  stock: number;
  categoryName?: string;
  index?: number;
  total?: number;
}

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  stock,
  categoryName,
  index,
  total,
}: ProductCardProps) {
  const productUrl = `/products/${slug || id}`;
  const ref =
    typeof index === "number" && typeof total === "number"
      ? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
      : null;

  return (
    <article className="group flex h-full flex-col">
      {/* ── Visual ─────────────────────────────────────────── */}
      <Link
        href={productUrl}
        className="relative block overflow-hidden rounded-[2px] bg-foreground/[0.04] ring-1 ring-inset ring-border/60 transition-colors duration-500 hover:ring-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        aria-label={name}
      >
        <div className="relative aspect-[3/4] w-full">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
              className="object-cover grayscale transition-[filter,transform] duration-[900ms] ease-out group-hover:grayscale-0"
            />
          ) : (
            <div className="absolute inset-0 bg-foreground/[0.04]" />
          )}

          {ref && (
            <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-foreground/40 transition-colors duration-500 group-hover:text-foreground">
              {ref}
            </span>
          )}

          <div className="absolute right-4 top-4">
            <StockBadge stock={stock} />
          </div>
        </div>
      </Link>

      {/* ── Meta ───────────────────────────────────────────── */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {categoryName && (
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              {categoryName}
            </p>
          )}
          <h3 className="mt-2 truncate font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">
            <Link
              href={productUrl}
              className="transition-colors hover:text-foreground/60 focus-visible:outline-none focus-visible:underline"
            >
              {name}
            </Link>
          </h3>
        </div>
        <span className="shrink-0 font-mono text-[13px] tabular-nums text-foreground/70">
          {formatPrice(price)}
        </span>
      </div>

      {/* ── Action band ────────────────────────────────────── */}
      <div className="mt-6 border-t border-border/60 pt-5">
        <AddToCartButton
          productId={id}
          productName={name}
          price={price}
          image={image}
          disabled={stock === 0}
        />
      </div>
    </article>
  );
}
