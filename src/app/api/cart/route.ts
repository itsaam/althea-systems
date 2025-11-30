import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Get cart items
  return NextResponse.json({ items: [] });
}

export async function POST() {
  // TODO: Add item to cart
  return NextResponse.json({ message: "Item added to cart" });
}

export async function PUT() {
  // TODO: Update cart item quantity
  return NextResponse.json({ message: "Cart updated" });
}

export async function DELETE() {
  // TODO: Remove item from cart
  return NextResponse.json({ message: "Item removed from cart" });
}
