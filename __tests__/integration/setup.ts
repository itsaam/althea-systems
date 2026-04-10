import { vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const prisma = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    address: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prisma };
});

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
  invalidateProductCache: vi.fn().mockResolvedValue(undefined),
  CACHE_KEYS: {
    search: (hash: string) => `search:${hash}`,
    products: "products:all",
  },
  CACHE_TTL: {
    search: 300,
    products: 600,
  },
}));

vi.mock("@/lib/logger/exports", () => {
  const noop = () => undefined;
  const logger = {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
  };
  const withApiLogger = <T extends (...args: unknown[]) => unknown>(fn: T) => fn;
  const loggedSuccessResponse = (
    data: unknown,
    _message?: string,
    status = 200
  ) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json" },
    });
  const loggedErrorResponse = (message: string, status = 500) =>
    new Response(JSON.stringify({ error: message, message }), {
      status,
      headers: { "content-type": "application/json" },
    });
  return {
    productLogger: logger,
    apiLogger: logger,
    orderLogger: logger,
    categoryLogger: logger,
    withApiLogger,
    loggedSuccessResponse,
    loggedErrorResponse,
    LogMessages: {
      product: {
        produitCree: (id: string, name: string) =>
          `Produit cree ${id} - ${name}`,
      },
    },
  };
});
