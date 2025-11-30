import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO: Handle Stripe webhook events
  const body = await request.text();
  console.log("Stripe webhook received:", body);
  return NextResponse.json({ received: true });
}
