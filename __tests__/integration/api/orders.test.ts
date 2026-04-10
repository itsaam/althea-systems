import { describe, it, expect, vi, beforeEach } from "vitest";
import "../setup";
import { makeRequest, readJson } from "./helpers";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { GET } from "@/app/api/orders/route";

const mockPrisma = prisma as unknown as {
  order: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
};
const mockSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session is present", async () => {
    mockSession.mockResolvedValue(null);

    const res = await GET(makeRequest("/api/orders"));
    expect(res.status).toBe(401);
  });

  it("returns orders scoped to current user when role is USER", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", role: "USER" } });
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.count.mockResolvedValue(0);

    const res = await GET(makeRequest("/api/orders"));
    expect(res.status).toBe(200);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "u1" }),
      })
    );
  });

  it("honours pagination params page + limit", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", role: "USER" } });
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.count.mockResolvedValue(42);

    const res = await GET(makeRequest("/api/orders?page=2&limit=5"));
    expect(res.status).toBe(200);

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );

    const json = await readJson<{
      pagination: { page: number; limit: number; total: number };
    }>(res);
    expect(json.pagination.page).toBe(2);
    expect(json.pagination.limit).toBe(5);
    expect(json.pagination.total).toBe(42);
  });

  it("admin can filter by arbitrary userId", async () => {
    mockSession.mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.count.mockResolvedValue(0);

    await GET(makeRequest("/api/orders?userId=u42"));

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "u42" }),
      })
    );
  });
});
