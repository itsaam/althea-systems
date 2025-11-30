import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch featured products
  return NextResponse.json({ products: [] });
}
