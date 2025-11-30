import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all categories
  return NextResponse.json({ categories: [] });
}

export async function POST() {
  // TODO: Create category
  return NextResponse.json({ message: "Category created" });
}
