import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all invoices
  return NextResponse.json({ invoices: [] });
}
