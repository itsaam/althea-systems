"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import AddToCartButton from "@/components/cart/add-to-cart-button";

interface SearchProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  image?: string;
  categoryId?: string;
  category?: {
    name: string;
    slug: string | null;
  };
}

interface SearchResponse {
  query: string;
  count: number;
  products: SearchProduct[];
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

type SortKey = "relevance" | "price-asc" | "price-desc" | "name-asc";
type ViewMode = "grid" | "list";

const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 250;

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Pertinence",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  "name-asc": "Nom (A → Z)",
};

function parseSort(value: string | null): SortKey {
  if (
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name-asc"
  ) {
    return value;
  }
  return "relevance";
}

function parseView(value: string | null): ViewMode {
  return value === "list" ? "list" : "grid";
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parsePriceBound(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(PRICE_MIN, Math.min(PRICE_MAX, n));
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const urlCategoryIdsRaw = searchParams.get("categoryIds") ?? "";
  const urlCategoryIds = useMemo(
    () =>
      urlCategoryIdsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [urlCategoryIdsRaw]
  );
  const urlDescQ = searchParams.get("descQ") ?? "";
  const urlSpecsQ = searchParams.get("specsQ") ?? "";
  const urlInStockOnly = searchParams.get("inStockOnly") === "1";
  const urlMin = parsePriceBound(searchParams.get("minPrice"), PRICE_MIN);
  const urlMax = parsePriceBound(searchParams.get("maxPrice"), PRICE_MAX);
  const urlSort = parseSort(searchParams.get("sort"));
  const urlView = parseView(searchParams.get("view"));
  const urlPage = parsePositiveInt(searchParams.get("page"), 1);

  const [inputValue, setInputValue] = useState(urlQuery);
  const [descInput, setDescInput] = useState(urlDescQ);
  const [specsInput, setSpecsInput] = useState(urlSpecsQ);
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(urlDescQ || urlSpecsQ)
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    urlMin,
    urlMax,
  ]);

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setDescInput(urlDescQ);
  }, [urlDescQ]);

  useEffect(() => {
    setSpecsInput(urlSpecsQ);
  }, [urlSpecsQ]);

  useEffect(() => {
    setPriceRange([urlMin, urlMax]);
  }, [urlMin, urlMax]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const list: Category[] = data?.data?.categories ?? data?.categories ?? [];
        setCategories(list);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load categories", err);
        }
      });
    return () => controller.abort();
  }, []);

  const hasAnyQuery =
    Boolean(urlQuery) ||
    urlCategoryIds.length > 0 ||
    Boolean(urlDescQ) ||
    Boolean(urlSpecsQ) ||
    urlInStockOnly;

  useEffect(() => {
    if (!hasAnyQuery) {
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (urlQuery) params.set("q", urlQuery);
    if (urlDescQ) params.set("descQ", urlDescQ);
    if (urlSpecsQ) params.set("specsQ", urlSpecsQ);
    if (urlCategoryIds.length > 0) {
      params.set("categoryIds", urlCategoryIds.join(","));
      // Rétro-compatibilité : si une seule catégorie, on envoie aussi `categoryId`.
      if (urlCategoryIds.length === 1) {
        params.set("categoryId", urlCategoryIds[0]);
      }
    }
    if (urlInStockOnly) params.set("inStockOnly", "1");
    params.set("minPrice", urlMin.toString());
    params.set("maxPrice", urlMax.toString());

    setLoading(true);
    setError(null);

    fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Erreur de recherche");
        }
        return res.json() as Promise<SearchResponse>;
      })
      .then((data) => setProducts(data.products))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Erreur serveur");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [
    hasAnyQuery,
    urlQuery,
    urlDescQ,
    urlSpecsQ,
    urlCategoryIds,
    urlInStockOnly,
    urlMin,
    urlMax,
  ]);

  const handleSubmitQuery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ q: inputValue.trim() || null });
  };

  useEffect(() => {
    if (inputValue === urlQuery) return;
    const id = window.setTimeout(() => {
      updateParams({ q: inputValue.trim() || null });
    }, SEARCH_DEBOUNCE);
    return () => window.clearTimeout(id);
  }, [inputValue, urlQuery, updateParams]);

  useEffect(() => {
    if (descInput === urlDescQ) return;
    const id = window.setTimeout(() => {
      updateParams({ descQ: descInput.trim() || null });
    }, SEARCH_DEBOUNCE);
    return () => window.clearTimeout(id);
  }, [descInput, urlDescQ, updateParams]);

  useEffect(() => {
    if (specsInput === urlSpecsQ) return;
    const id = window.setTimeout(() => {
      updateParams({ specsQ: specsInput.trim() || null });
    }, SEARCH_DEBOUNCE);
    return () => window.clearTimeout(id);
  }, [specsInput, urlSpecsQ, updateParams]);

  const toggleCategory = useCallback(
    (id: string) => {
      const next = urlCategoryIds.includes(id)
        ? urlCategoryIds.filter((c) => c !== id)
        : [...urlCategoryIds, id];
      updateParams({
        categoryIds: next.length ? next.join(",") : null,
      });
    },
    [urlCategoryIds, updateParams]
  );

  const toggleInStock = useCallback(
    (checked: boolean) => {
      updateParams({ inStockOnly: checked ? "1" : null });
    },
    [updateParams]
  );

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    switch (urlSort) {
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      case "name-asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      default:
        return copy;
    }
  }, [products, urlSort]);

  const totalCount = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(urlPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedProducts = sortedProducts.slice(pageStart, pageStart + PAGE_SIZE);

  const activeCategories = useMemo(
    () => categories.filter((c) => urlCategoryIds.includes(c.id)),
    [categories, urlCategoryIds]
  );
  const singleActiveCategory =
    urlCategoryIds.length === 1 ? activeCategories[0] : undefined;
  const hasPriceFilter = urlMin !== PRICE_MIN || urlMax !== PRICE_MAX;
  const hasAnyFilter =
    urlCategoryIds.length > 0 ||
    hasPriceFilter ||
    Boolean(urlQuery) ||
    Boolean(urlDescQ) ||
    Boolean(urlSpecsQ) ||
    urlInStockOnly;

  const resetFilters = () => {
    router.replace("/search", { scroll: false });
  };

  const filtersPanel = (
    <div className="space-y-8">
      {/* Disponibilité */}
      <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 p-3">
        <Label
          htmlFor="filter-stock"
          className="flex flex-col gap-0.5 text-sm font-medium text-foreground"
        >
          Uniquement produits disponibles
          <span className="text-[11px] font-normal text-muted-foreground">
            Masquer les articles en rupture
          </span>
        </Label>
        <Switch
          id="filter-stock"
          checked={urlInStockOnly}
          onCheckedChange={toggleInStock}
          aria-label="Filtrer uniquement les produits disponibles"
        />
      </div>

      {/* Catégories multi-select */}
      <div>
        <Label
          id="filter-categories-label"
          className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Catégories
        </Label>
        <ul
          role="group"
          aria-labelledby="filter-categories-label"
          className="space-y-1"
        >
          {categories.map((cat) => {
            const checked = urlCategoryIds.includes(cat.id);
            const inputId = `cat-${cat.id}`;
            return (
              <li key={cat.id}>
                <label
                  htmlFor={inputId}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    checked
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      aria-label={cat.name}
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  {typeof cat._count?.products === "number" && (
                    <span className="ml-2 shrink-0 font-mono text-[11px] opacity-60">
                      {cat._count.products}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Prix */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prix
          </Label>
          <span className="text-xs text-muted-foreground">
            {priceRange[0]} € — {priceRange[1]} €
          </span>
        </div>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={priceRange}
          onValueChange={(val) => {
            if (val.length === 2) setPriceRange([val[0], val[1]]);
          }}
          onValueCommit={(val) => {
            if (val.length !== 2) return;
            updateParams({
              minPrice: val[0] === PRICE_MIN ? null : val[0].toString(),
              maxPrice: val[1] === PRICE_MAX ? null : val[1].toString(),
            });
          }}
          aria-label="Fourchette de prix"
          className="mt-4"
        />
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{PRICE_MIN} €</span>
          <div className="h-px flex-1 bg-border" />
          <span>{PRICE_MAX} €</span>
        </div>
      </div>

      {/* Filtres avancés */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          aria-controls="advanced-filters"
        >
          Filtres avancés
          <span aria-hidden="true">{advancedOpen ? "−" : "+"}</span>
        </Button>

        {advancedOpen && (
          <div id="advanced-filters" className="mt-3 space-y-4">
            <div>
              <Label
                htmlFor="filter-desc"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Rechercher dans la description
              </Label>
              <Input
                id="filter-desc"
                type="search"
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Ex: sans latex, stérile…"
                className="h-9 text-sm"
                autoComplete="off"
              />
            </div>
            <div>
              <Label
                htmlFor="filter-specs"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Caractéristiques techniques
              </Label>
              <Input
                id="filter-specs"
                type="search"
                value={specsInput}
                onChange={(e) => setSpecsInput(e.target.value)}
                placeholder="Ex: 12V, 220mm, ISO 13485…"
                className="h-9 text-sm"
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </div>

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={resetFilters}
        >
          <X className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Catalogue
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          {urlQuery ? (
            <>
              Résultats pour{" "}
              <span className="italic text-muted-foreground">
                « {urlQuery} »
              </span>
            </>
          ) : singleActiveCategory ? (
            singleActiveCategory.name
          ) : (
            "Recherche produits"
          )}
        </h1>

        <form onSubmit={handleSubmitQuery} className="mt-6 max-w-2xl" role="search">
          <Label htmlFor="search-query" className="sr-only">
            Rechercher un produit
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="search-query"
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Stéthoscope, tensiomètre, gants nitrile…"
              className="h-12 pl-11 pr-4 text-base"
              autoComplete="off"
            />
          </div>
        </form>

        {hasAnyFilter && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtres actifs
            </span>
            {urlQuery && (
              <Badge
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                {urlQuery}
                <button
                  type="button"
                  onClick={() => updateParams({ q: null })}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label={`Retirer la recherche « ${urlQuery} »`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label={`Retirer la catégorie ${cat.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {urlInStockOnly && (
              <Badge
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                Disponibles uniquement
                <button
                  type="button"
                  onClick={() => toggleInStock(false)}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label="Retirer le filtre disponibilité"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {urlDescQ && (
              <Badge
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                Description : {urlDescQ}
                <button
                  type="button"
                  onClick={() => updateParams({ descQ: null })}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label="Retirer le filtre description"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {urlSpecsQ && (
              <Badge
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                Caractéristiques : {urlSpecsQ}
                <button
                  type="button"
                  onClick={() => updateParams({ specsQ: null })}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label="Retirer le filtre caractéristiques"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasPriceFilter && (
              <Badge
                variant="secondary"
                className="gap-1.5 pl-3 pr-1.5 py-1 text-xs"
              >
                {urlMin} € — {urlMax} €
                <button
                  type="button"
                  onClick={() =>
                    updateParams({ minPrice: null, maxPrice: null })
                  }
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label="Retirer le filtre de prix"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <p className="mb-6 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtres
            </p>
            {filtersPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto p-6">
                  <p className="mb-6 flex items-center gap-2 text-sm font-semibold">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filtres
                  </p>
                  {filtersPanel}
                </SheetContent>
              </Sheet>
              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {loading ? (
                  "Recherche…"
                ) : totalCount > 0 ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {totalCount}
                    </span>{" "}
                    {totalCount > 1 ? "résultats" : "résultat"}
                  </>
                ) : (
                  "Aucun résultat"
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={urlSort}
                onValueChange={(val) => updateParams({ sort: val === "relevance" ? null : val })}
              >
                <SelectTrigger className="h-9 w-[180px] text-sm" aria-label="Trier par">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {SORT_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                role="radiogroup"
                aria-label="Mode d'affichage"
                className="hidden items-center rounded-md border bg-muted/40 p-0.5 sm:flex"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={urlView === "grid"}
                  onClick={() => updateParams({ view: null }, { resetPage: false })}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                    urlView === "grid"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={urlView === "list"}
                  onClick={() => updateParams({ view: "list" }, { resetPage: false })}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                    urlView === "list"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Vue liste"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <ResultsSkeleton view={urlView} />
          ) : error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
            >
              {error}
            </div>
          ) : !hasAnyQuery ? (
            <EmptyStart />
          ) : totalCount === 0 ? (
            <EmptyResults query={urlQuery} onReset={resetFilters} />
          ) : urlView === "list" ? (
            <ResultsList products={pagedProducts} />
          ) : (
            <ResultsGrid products={pagedProducts} />
          )}

          {!loading && totalCount > PAGE_SIZE && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={(p) =>
                updateParams({ page: p === 1 ? null : p.toString() }, { resetPage: false })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsGrid({ products }: { products: SearchProduct[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const href = `/products/${product.slug || product.id}`;
        return (
          <li key={product.id}>
            <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
              <Link href={href} className="relative block aspect-[4/3] bg-muted">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Image indisponible
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                {product.category && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {product.category.name}
                  </p>
                )}
                <Link href={href} className="mt-1.5">
                  <h3 className="line-clamp-2 text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-auto pt-4">
                  <div className="mb-3 text-xl font-bold tracking-tight">
                    {product.price.toFixed(2)} €
                  </div>
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    image={product.image}
                  />
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function ResultsList({ products }: { products: SearchProduct[] }) {
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {products.map((product) => {
        const href = `/products/${product.slug || product.id}`;
        return (
          <li key={product.id}>
            <article className="group flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
              <Link
                href={href}
                className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-40 sm:aspect-auto"
              >
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Image indisponible
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                {product.category && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {product.category.name}
                  </p>
                )}
                <Link href={href}>
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold tracking-tight transition-colors group-hover:text-primary md:text-lg">
                    {product.name}
                  </h3>
                </Link>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <div className="text-xl font-bold tracking-tight md:text-2xl">
                  {product.price.toFixed(2)} €
                </div>
                <div className="w-44">
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    image={product.image}
                  />
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function ResultsSkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <Skeleton className="h-28 w-full rounded-lg sm:w-40" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-44" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyStart() {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 p-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Search className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-bold tracking-tight">
        Commencez votre recherche
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Tapez un nom de produit, une marque ou sélectionnez une catégorie pour
        explorer notre catalogue d&apos;équipements médicaux certifiés.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/categories">Parcourir les catégories</Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyResults({
  query,
  onReset,
}: {
  query: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 p-14 text-center">
      <h2 className="text-lg font-bold tracking-tight">Aucun résultat trouvé</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {query ? (
          <>
            Nous n&apos;avons trouvé aucun produit correspondant à{" "}
            <span className="font-semibold text-foreground">« {query} »</span>{" "}
            avec les filtres actuels. Essayez d&apos;élargir votre recherche.
          </>
        ) : (
          "Aucun produit ne correspond aux filtres actuels. Essayez de les élargir."
        )}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
        <Button asChild size="sm">
          <Link href="/categories">Explorer les catégories</Link>
        </Button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const list: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  }, [page, totalPages]);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="Pagination des résultats"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Précédent
      </Button>
      {pages[0] > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {pages[0] > 2 && (
            <span className="px-2 text-sm text-muted-foreground">…</span>
          )}
        </>
      )}
      {pages.map((p) => (
        <Button
          key={p}
          type="button"
          variant={p === page ? "default" : "ghost"}
          size="sm"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-sm text-muted-foreground">…</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
      </Button>
    </nav>
  );
}
