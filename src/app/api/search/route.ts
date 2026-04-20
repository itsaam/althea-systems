import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
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
  stock: number;
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
  total: number;
  page: number;
  limit: number;
  products: SearchProduct[];
}

const REDIS_TIMEOUT_MS = 500;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const SQL_FETCH_LIMIT = 200;

/**
 * Validation des query params. On garde `q` / `categoryId` pour la
 * rétrocompatibilité, et on ajoute :
 *   - descQ         : recherche dans la description
 *   - specsQ        : recherche dans les caractéristiques techniques
 *                     (`Product.technicalSpecs`, fallback `description`)
 *   - categoryIds   : multi-catégories, CSV
 *   - inStockOnly   : "1" | "true" (filtrage stock > 0 + status PUBLISHED)
 *   - page / limit  : pagination
 */
const searchParamsSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  descQ: z.string().trim().max(200).optional().default(""),
  specsQ: z.string().trim().max(200).optional().default(""),
  categoryId: z.string().trim().max(50).optional(),
  categoryIds: z.string().trim().max(500).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStockOnly: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

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

/**
 * Règles de ranking CDC §VIII sur le titre :
 *   - Correspondance exacte       → 1000
 *   - 1 caractère de différent    → 500  (Levenshtein <= 1)
 *   - Commence par                → 100
 *   - Contient                    → 10
 *
 * Bonus internes (non exposés au CDC) : tokens du titre, description, specs.
 * L'implémentation est faite côté Node après une requête Prisma large
 * (pas de pg_trgm requis).
 */
function nameScore(query: string, name: string): number {
  if (!query) return 0;
  const q = normalize(query);
  const n = normalize(name);

  if (n === q) return 1000;

  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes(q)) return 950;

  if (q.length >= 3) {
    if (levenshtein(n, q, 1) <= 1) return 500;
    for (const t of tokens) {
      if (t.length >= 3 && levenshtein(t, q, 1) <= 1) return 480;
    }
  }

  if (n.startsWith(q)) return 100;
  for (const t of tokens) {
    if (t.startsWith(q)) return 90;
  }

  if (n.includes(q)) return 10;
  return 0;
}

function containsBonus(query: string, text: string | null | undefined): number {
  if (!query || !text) return 0;
  return normalize(text).includes(normalize(query)) ? 1 : 0;
}

function hashFilters(filters: Record<string, string | number | boolean | null | undefined>): string {
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
    const parsed = searchParamsSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Paramètres invalides", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      q: query,
      descQ,
      specsQ,
      categoryId,
      categoryIds,
      minPrice,
      maxPrice,
      inStockOnly,
      page,
      limit,
    } = parsed.data;

    // Multi-catégories : on unifie categoryId (single legacy) + categoryIds CSV
    const catIds = new Set<string>();
    if (categoryId) catIds.add(categoryId);
    if (categoryIds) {
      for (const id of categoryIds.split(",").map((s) => s.trim()).filter(Boolean)) {
        catIds.add(id);
      }
    }

    if (!query && !descQ && !specsQ && catIds.size === 0 && !inStockOnly) {
      return NextResponse.json(
        { message: "Veuillez fournir au moins un critère de recherche" },
        { status: 400 }
      );
    }

    const filters = {
      q: query,
      descQ,
      specsQ,
      cats: [...catIds].sort().join(","),
      minPrice,
      maxPrice,
      inStockOnly,
      page,
      limit,
    };
    const cacheKey = CACHE_KEYS.search(hashFilters(filters));

    let cacheStatus: "HIT" | "MISS" | "BYPASS" = "MISS";

    try {
      const cached = await withTimeout(
        getCache<SearchResponse>(cacheKey),
        REDIS_TIMEOUT_MS
      );
      if (cached) {
        apiLogger.debug(`search cache HIT ${cacheKey}`);
        return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
      }
    } catch (err) {
      cacheStatus = "BYPASS";
      apiLogger.warn(
        `search cache read failed, bypassing: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    const andClauses: Prisma.ProductWhereInput[] = [];

    if (query) {
      // Large match sur le titre (filtrage côté SQL), le ranking précis
      // est appliqué après récupération.
      andClauses.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (descQ) {
      andClauses.push({
        description: { contains: descQ, mode: "insensitive" },
      });
    }

    if (specsQ) {
      andClauses.push({
        OR: [
          { technicalSpecs: { contains: specsQ, mode: "insensitive" } },
          { description: { contains: specsQ, mode: "insensitive" } },
        ],
      });
    }

    if (catIds.size > 0) {
      andClauses.push({ categoryId: { in: [...catIds] } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      andClauses.push({ price: priceFilter });
    }

    if (inStockOnly) {
      andClauses.push({ stock: { gt: 0 } });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    // Si pas de query textuelle → pagination SQL directe.
    // Sinon, on fetch large puis on scorer en mémoire.
    const hasTextQuery = Boolean(query);

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
        },
        take: hasTextQuery ? SQL_FETCH_LIMIT : limit,
        skip: hasTextQuery ? 0 : (page - 1) * limit,
        orderBy: hasTextQuery
          ? [{ priority: "desc" }, { createdAt: "desc" }]
          : [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.product.count({ where }),
    ]);

    let ordered = rawProducts;

    if (hasTextQuery) {
      const scored = rawProducts
        .map((p) => {
          const score =
            nameScore(query, p.name) +
            containsBonus(descQ, p.description) * 2 +
            containsBonus(specsQ, p.technicalSpecs ?? p.description);
          return { p, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.p.priority !== a.p.priority) return b.p.priority - a.p.priority;
          // Disponibilité : stock > 0 avant stock == 0
          const aAvail = a.p.stock > 0 ? 1 : 0;
          const bAvail = b.p.stock > 0 ? 1 : 0;
          if (bAvail !== aAvail) return bAvail - aAvail;
          return b.p.createdAt.getTime() - a.p.createdAt.getTime();
        })
        .map((s) => s.p);

      // Pagination manuelle après ranking
      const start = (page - 1) * limit;
      ordered = scored.slice(start, start + limit);
    }

    const formattedProducts: SearchProduct[] = ordered.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      stock: p.stock,
      image: p.images?.[0] || undefined,
      categoryId: p.categoryId || undefined,
      category: p.category || undefined,
    }));

    const payload: SearchResponse = {
      query,
      count: formattedProducts.length,
      total: hasTextQuery
        ? // Dans le cas du ranking en mémoire, le total "vrai" est borné par
          // le fetch (SQL_FETCH_LIMIT). On renvoie min(total, fetch).
          Math.min(total, SQL_FETCH_LIMIT)
        : total,
      page,
      limit,
      products: formattedProducts,
    };

    if (cacheStatus !== "BYPASS") {
      apiLogger.debug(`search cache MISS ${cacheKey}`);
      withTimeout(
        setCache(cacheKey, payload, CACHE_TTL.search),
        REDIS_TIMEOUT_MS
      ).catch((err) => {
        apiLogger.warn(
          `search cache write failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      });
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
