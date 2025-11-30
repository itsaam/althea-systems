import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch all users (admin only)
  return NextResponse.json({ users: [] });
}
