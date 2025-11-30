import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Create Stripe checkout session
  return NextResponse.json({ sessionId: "" });
}
