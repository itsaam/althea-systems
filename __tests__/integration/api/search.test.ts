import { describe, it, expect, vi, beforeEach } from "vitest";
import "../setup";
import { makeRequest, readJson } from "./helpers";

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/search/route";

const mockPrisma = prisma as unknown as {
  product: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no query and no category are provided", async () => {
    const res = await GET(makeRequest("/api/search"));
    expect(res.status).toBe(400);
  });

  it("returns 200 and a results payload with X-Cache header", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: "p1",
        name: "creme test",
        slug: "creme-test",
        price: { toString: () => "19.90" },
        description: "descriptif",
        images: ["img.jpg"],
        categoryId: "cat-1",
        category: { name: "Soins", slug: "soins" },
      },
    ]);

    const res = await GET(makeRequest("/api/search?q=creme"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-cache")).toBeTruthy();

    const json = await readJson<{
      query: string;
      count: number;
      products: Array<{ id: string }>;
    }>(res);
    expect(json.query).toBe("creme");
    expect(json.products.length).toBeGreaterThanOrEqual(0);
  });

  it("allows filtering by categoryId without a query", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("/api/search?categoryId=cat-1"));
    expect(res.status).toBe(200);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: "cat-1" }),
      })
    );
  });

  it("returns 500 on prisma failure", async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error("boom"));
    const res = await GET(makeRequest("/api/search?q=test"));
    expect(res.status).toBe(500);
  });
});
