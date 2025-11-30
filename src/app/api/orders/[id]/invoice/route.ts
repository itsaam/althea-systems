import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Generate invoice PDF for order
  return NextResponse.json({ message: `Invoice for order ${id}` });
}
