import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all orders
  return NextResponse.json({ orders: [] });
}

export async function POST() {
  // TODO: Create order
  return NextResponse.json({ message: "Order created" });
}
