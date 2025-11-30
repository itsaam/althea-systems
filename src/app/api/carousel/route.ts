import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch carousel items
  return NextResponse.json({ items: [] });
}

export async function POST() {
  // TODO: Create carousel item
  return NextResponse.json({ message: "Carousel item created" });
}
