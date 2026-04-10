import { describe, it, expect, vi, beforeEach } from "vitest";
import "../setup";
import { makeRequest, readJson, routeContext } from "./helpers";

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/products/[id]/route";

const mockPrisma = prisma as unknown as {
  product: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

const productRecord = {
  id: "p1",
  name: "Crème",
  slug: "creme",
  description: null,
  price: { toNumber: () => 19.9 },
  comparePrice: null,
  stock: 5,
  images: ["img.jpg"],
  featured: false,
  tva: "TVA_20",
  category: { id: "cat-1", name: "Soins", slug: "soins" },
};

describe("GET /api/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and the product when found", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(productRecord);

    const res = await GET(
      makeRequest("/api/products/p1"),
      routeContext({ id: "p1" })
    );
    expect(res.status).toBe(200);
    const json = await readJson<{ product: { id: string; price: number } }>(
      res
    );
    expect(json.product.id).toBe("p1");
    expect(json.product.price).toBe(19.9);
  });

  it("returns 404 when the product does not exist", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await GET(
      makeRequest("/api/products/missing"),
      routeContext({ id: "missing" })
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 when prisma throws", async () => {
    mockPrisma.product.findUnique.mockRejectedValue(new Error("boom"));

    const res = await GET(
      makeRequest("/api/products/p1"),
      routeContext({ id: "p1" })
    );
    expect(res.status).toBe(500);
  });
});
