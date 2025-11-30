import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch dashboard stats
  return NextResponse.json({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
}
