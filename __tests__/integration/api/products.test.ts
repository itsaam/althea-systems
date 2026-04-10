import { describe, it, expect, vi, beforeEach } from "vitest";
import "../setup";
import { makeRequest, readJson } from "./helpers";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/products/route";

const mockPrisma = prisma as unknown as {
  product: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  category: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

const mockSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

const sampleProduct = {
  id: "p1",
  name: "Crème Althea",
  slug: "creme-althea",
  description: "Une crème apaisante",
  price: 29.9,
  comparePrice: null,
  stock: 12,
  images: ["https://example.com/p1.jpg"],
  featured: true,
  createdAt: new Date("2026-01-01").toISOString(),
  categoryId: "cat-1",
  tva: "TVA_20",
  category: { id: "cat-1", name: "Soins", slug: "soins" },
};

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of products with 200", async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

    const res = await GET(makeRequest("/api/products"));
    expect(res.status).toBe(200);

    const json = await readJson<{ products: Array<{ id: string }> }>(res);
    expect(Array.isArray(json.products)).toBe(true);
    expect(json.products).toHaveLength(1);
    expect(json.products[0].id).toBe("p1");
  });

  it("applies categoryId filter to prisma", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/products?categoryId=cat-1"));

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: "cat-1" }),
      })
    );
  });

  it("applies featured filter when featured=true", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/products?featured=true"));

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ featured: true }),
      })
    );
  });

  it("returns 500 when prisma throws", async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error("DB down"));
    const res = await GET(makeRequest("/api/products"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests with 403", async () => {
    mockSession.mockResolvedValue(null);

    const res = await POST(
      makeRequest("/api/products", {
        method: "POST",
        body: { name: "x", slug: "x", price: 1 },
      })
    );
    expect(res.status).toBe(403);
  });

  it("rejects non-admin users with 403", async () => {
    mockSession.mockResolvedValue({ user: { role: "USER" } });

    const res = await POST(
      makeRequest("/api/products", {
        method: "POST",
        body: { name: "x", slug: "x", price: 1 },
      })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid payload", async () => {
    mockSession.mockResolvedValue({ user: { role: "ADMIN" } });

    const res = await POST(
      makeRequest("/api/products", {
        method: "POST",
        body: { name: "", slug: "", price: -1 },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when slug already exists", async () => {
    mockSession.mockResolvedValue({ user: { role: "ADMIN" } });
    mockPrisma.product.findUnique.mockResolvedValue(sampleProduct);

    const res = await POST(
      makeRequest("/api/products", {
        method: "POST",
        body: { name: "x", slug: "creme-althea", price: 10 },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates a product and returns 201 for an admin", async () => {
    mockSession.mockResolvedValue({ user: { role: "ADMIN" } });
    mockPrisma.product.findUnique.mockResolvedValue(null);
    mockPrisma.product.create.mockResolvedValue(sampleProduct);

    const res = await POST(
      makeRequest("/api/products", {
        method: "POST",
        body: {
          name: "Crème Althea",
          slug: "creme-althea-2",
          price: 29.9,
        },
      })
    );
    expect(res.status).toBe(201);
    const json = await readJson<{ product: { id: string } }>(res);
    expect(json.product?.id).toBe("p1");
  });
});
