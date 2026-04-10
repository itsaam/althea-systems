import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  getCache,
  setCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/redis";
import { apiLogger } from "@/lib/logger/exports";

interface SearchProduct {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  image?: string;
  categoryId?: string | null;
  category?: {
    name: string;
    slug: string | null;
  } | null;
}

interface SearchResponse {
  query: string;
  count: number;
  products: SearchProduct[];
}

const REDIS_TIMEOUT_MS = 500;
const MAX_RESULTS = 50;
const SQL_FETCH_LIMIT = 100;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function levenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp: number[] = Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      prev = tmp;
      if (dp[j] < rowMin) rowMin = dp[j];
    }
    if (rowMin > max) return max + 1;
  }
  return dp[b.length];
}

function matchScore(query: string, name: string, description: string | null): number {
  if (!query) return 0;
  const q = normalize(query);
  const n = normalize(name);
  const d = description ? normalize(description) : "";

  // Exact match on name (whole or per-token)
  if (n === q) return 1000;
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes(q)) return 900;

  // Typo (1 char diff) on name or any token
  if (q.length >= 3) {
    if (levenshtein(n, q, 1) <= 1) return 800;
    for (const t of tokens) {
      if (t.length >= 3 && levenshtein(t, q, 1) <= 1) return 750;
    }
  }

  // Starts with on name
  if (n.startsWith(q)) return 600;
  for (const t of tokens) {
    if (t.startsWith(q)) return 550;
  }

  // Contains on name
  if (n.includes(q)) return 400;

  // Contains on description
  if (d.includes(q)) return 200;

  return 0;
}

function hashFilters(filters: Record<string, string | null>): string {
  const normalized = Object.keys(filters)
    .sort()
    .map((k) => `${k}=${filters[k] ?? ""}`)
    .join("&");
  return createHash("sha1").update(normalized).digest("hex").slice(0, 16);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (!query && !categoryId) {
      return NextResponse.json(
        { message: "Veuillez fournir une query ou une catégorie" },
        { status: 400 }
      );
    }

    const filters = { q: query, categoryId, minPrice, maxPrice };
    const cacheKey = CACHE_KEYS.search(hashFilters(filters));

    let cacheStatus: "HIT" | "MISS" | "BYPASS" = "MISS";

    try {
      const cached = await withTimeout(
        getCache<SearchResponse>(cacheKey),
        REDIS_TIMEOUT_MS
      );
      if (cached) {
        apiLogger.debug(`search cache HIT ${cacheKey}`);
        return NextResponse.json(cached, {
          headers: { "X-Cache": "HIT" },
        });
      }
    } catch (err) {
      cacheStatus = "BYPASS";
      apiLogger.warn(
        `search cache read failed, bypassing: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    const whereClause: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) {
        priceFilter.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceFilter.lte = parseFloat(maxPrice);
      }
      whereClause.price = priceFilter;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: query ? SQL_FETCH_LIMIT : MAX_RESULTS,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply matching rules when a text query is provided:
    // exact > 1-char typo > starts-with > contains.
    const scored = query
      ? products
          .map((p) => ({
            product: p,
            score: matchScore(query, p.name, p.description),
          }))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_RESULTS)
          .map((s) => s.product)
      : products;

    const formattedProducts: SearchProduct[] = scored.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images?.[0] || undefined,
      categoryId: p.categoryId || undefined,
      category: p.category || undefined,
    }));

    const payload: SearchResponse = {
      query,
      count: formattedProducts.length,
      products: formattedProducts,
    };

    if (cacheStatus !== "BYPASS") {
      apiLogger.debug(`search cache MISS ${cacheKey}`);
      withTimeout(setCache(cacheKey, payload, CACHE_TTL.search), REDIS_TIMEOUT_MS).catch(
        (err) => {
          apiLogger.warn(
            `search cache write failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      );
    }

    return NextResponse.json(payload, {
      headers: { "X-Cache": cacheStatus },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    apiLogger.error(`Search error: ${message}`);
    return NextResponse.json({ message }, { status: 500 });
  }
}
