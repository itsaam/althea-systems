import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import ShareButtons from "@/components/products/share-buttons";
import StockBadge from "@/components/products/stock-badge";
import TrustBadges from "@/components/products/trust-badges";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    sku?: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    image: string | null;
    category: Category | null;
  };
  shareUrl: string;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function ProductInfo({ product, shareUrl }: ProductInfoProps) {
  const hasDiscount =
    product.comparePrice !== null &&
    product.comparePrice !== undefined &&
    product.comparePrice > product.price;

  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : null;

  return (
    <div className="flex flex-col gap-10 lg:sticky lg:top-28 lg:self-start">
      {/* ── Header block ─────────────────────────────── */}
      <div>
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="eyebrow group inline-flex items-center gap-2 hover:text-electric-indigo-600"
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-current transition-all duration-500 ease-out-expo group-hover:w-10"
            />
            {product.category.name}
          </Link>
        )}

        <h1 className="font-display mt-6 text-4xl italic leading-[0.95] tracking-tight text-shadow-grey-900 md:text-5xl lg:text-6xl">
          {product.name}
        </h1>

        {product.sku && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-shadow-grey-500">
            Réf. {product.sku}
          </p>
        )}
      </div>

      {/* ── Price block ──────────────────────────────── */}
      <div className="flex flex-col gap-3 border-y border-shadow-grey-200 py-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="font-display text-5xl italic leading-none text-electric-indigo-500 md:text-6xl">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-shadow-grey-400 line-through">
                {formatPrice(product.comparePrice!)}
              </span>
              <span className="rounded-full bg-electric-indigo-500 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                −{discountPct}%
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-shadow-grey-500">
          TVA 20% incluse · Livraison calculée au checkout
        </p>

        <div className="mt-2 flex items-center gap-3">
          <StockBadge stock={product.stock} />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-shadow-grey-500">
            {product.stock > 0
              ? `${product.stock} unité${product.stock > 1 ? "s" : ""} disponible${product.stock > 1 ? "s" : ""}`
              : "Commande sur demande"}
          </span>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────── */}
      <div>
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          price={product.price}
          image={product.image || undefined}
          disabled={product.stock === 0}
        />
      </div>

      {/* ── Trust badges ─────────────────────────────── */}
      <TrustBadges />

      {/* ── Share ────────────────────────────────────── */}
      <div className="border-t border-shadow-grey-200 pt-8">
        <ShareButtons
          url={shareUrl}
          title={product.name}
          description={product.description || undefined}
        />
      </div>

      {/* ── Contact nudge ───────────────────────────── */}
      <Link
        href="/contact"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-shadow-grey-200 bg-background p-5 transition-all duration-500 ease-out-expo hover:border-shadow-grey-900 hover:bg-shadow-grey-950 hover:text-white"
      >
        <div>
          <p className="eyebrow text-lavender-mist-600 group-hover:text-lavender-mist-300">
            Besoin d&apos;un devis ?
          </p>
          <p className="mt-2 text-sm font-medium text-shadow-grey-900 group-hover:text-white">
            Parlez à un conseiller Althea
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-shadow-grey-300 text-shadow-grey-900 transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-white group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
