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
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProducts: SearchProduct[] = products.map((p) => ({
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
