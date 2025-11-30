import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch user addresses
  return NextResponse.json({ addresses: [] });
}

export async function POST() {
  // TODO: Create address
  return NextResponse.json({ message: "Address created" });
}
