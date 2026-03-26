import { NextRequest, NextResponse } from "next/server";
import { downloadFromR2, headObjectR2 } from "@/lib/r2";

interface RouteParams {
  params: Promise<{ key: string }>;
}

/**
 * GET /api/images/[key]
 * Proxy an image from R2. Supports nested keys via encoded slashes.
 * In practice, images are served directly from the R2 public URL (CDN).
 * This endpoint is useful as a fallback or for private buckets.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    // Allow nested paths via query param (e.g., /api/images/products?file=uuid.jpg)
    const file = request.nextUrl.searchParams.get("file");
    const fullKey = file ? `${decodedKey}/${file}` : decodedKey;

    // HEAD check first to fail fast
    const meta = await headObjectR2(fullKey);
    if (!meta) {
      return NextResponse.json(
        { error: "Image non trouvee" },
        { status: 404 }
      );
    }

    const result = await downloadFromR2(fullKey);
    if (!result || !result.body) {
      return NextResponse.json(
        { error: "Image non trouvee" },
        { status: 404 }
      );
    }

    return new NextResponse(result.body as ReadableStream, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": String(result.contentLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
