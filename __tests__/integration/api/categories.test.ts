import { describe, it, expect, vi, beforeEach } from "vitest";
import "../setup";
import { makeRequest, readJson } from "./helpers";

import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/categories/route";
import { getServerSession } from "next-auth";

const mockPrisma = prisma as unknown as {
  category: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};
const mockSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with list of categories", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Soins",
        slug: "soins",
        description: null,
        image: null,
        parentId: null,
        active: true,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        _count: { products: 4 },
      },
    ]);

    const res = await GET(makeRequest("/api/categories"));
    expect(res.status).toBe(200);
    const json = await readJson<{ categories: Array<{ id: string }> }>(res);
    expect(json.categories).toHaveLength(1);
    expect(json.categories[0].id).toBe("cat-1");
  });

  it("returns 500 when prisma throws", async () => {
    mockPrisma.category.findMany.mockRejectedValue(new Error("DB error"));
    const res = await GET(makeRequest("/api/categories"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a session", async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(
      makeRequest("/api/categories", {
        method: "POST",
        body: { name: "A", slug: "a" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when user is not admin", async () => {
    mockSession.mockResolvedValue({ user: { role: "USER" } });
    const res = await POST(
      makeRequest("/api/categories", {
        method: "POST",
        body: { name: "A", slug: "a" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("creates a category when admin sends a valid payload", async () => {
    mockSession.mockResolvedValue({ user: { role: "ADMIN" } });
    mockPrisma.category.create.mockResolvedValue({
      id: "cat-2",
      name: "Nouveau",
      slug: "nouveau",
    });

    const res = await POST(
      makeRequest("/api/categories", {
        method: "POST",
        body: { name: "Nouveau", slug: "nouveau" },
      })
    );
    expect(res.status).toBe(201);
  });
});
