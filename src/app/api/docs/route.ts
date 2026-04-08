import { NextResponse } from "next/server";
import { swaggerSpec } from "./swagger";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(swaggerSpec);
}