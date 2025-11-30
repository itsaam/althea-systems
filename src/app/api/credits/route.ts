import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all credits
  return NextResponse.json({ credits: [] });
}

export async function POST() {
  // TODO: Create credit
  return NextResponse.json({ message: "Credit created" });
}
