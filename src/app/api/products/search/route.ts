import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  // TODO: Implement advanced search
  return NextResponse.json({ results: [], query });
}
