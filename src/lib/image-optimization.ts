import sharp from "sharp";
import { uploadToR2, type R2Folder } from "@/lib/r2";
import { uploadLogger } from "@/lib/logger/exports";

// ==================== CONFIGURATION ====================

export const IMAGE_CONFIG = {
  /** Max dimension on longest side for the main image */
  maxDimension: 2000,
  /** WebP quality for main image */
  mainQuality: 85,
  /** Thumbnail dimensions (square, fit inside) */
  thumbnailSize: 400,
  /** WebP quality for thumbnail */
  thumbnailQuality: 80,
  /** Max accepted upload size in bytes (5 MB) */
  maxUploadBytes: 5 * 1024 * 1024,
} as const;

/** Accepted input MIME types (validated against magic bytes, not client-reported header). */
export const ACCEPTED_INPUT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type AcceptedMime = (typeof ACCEPTED_INPUT_MIME)[number];

// ==================== MAGIC BYTES VALIDATION ====================

/**
 * Detect image MIME type from magic bytes.
 * Returns null if the buffer does not match any accepted image type.
 */
export function detectImageMime(buffer: Buffer): AcceptedMime | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF: 47 49 46 38 (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  // AVIF: ....ftypavif or ftypheic variants. Check 'ftyp' at offset 4 then brand.
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    const brand = buffer.slice(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return "image/avif";
    }
  }

  return null;
}

// ==================== OPTIMIZATION PIPELINE ====================

export interface OptimizedImage {
  /** WebP buffer, resized and compressed */
  mainBuffer: Buffer;
  /** WebP thumbnail buffer */
  thumbnailBuffer: Buffer;
  /** Original width in pixels (after potential EXIF rotation) */
  width: number;
  /** Original height in pixels */
  height: number;
  /** Main buffer content type (always image/webp) */
  contentType: "image/webp";
}

/**
 * Run the sharp pipeline on an input buffer:
 * - Auto-rotate based on EXIF
 * - Strip metadata (EXIF, etc.)
 * - Resize main image to maxDimension on longest side (no upscaling)
 * - Convert main image to WebP with quality=85
 * - Generate 400x400 thumbnail (fit: inside) as WebP
 */
export async function optimizeImage(input: Buffer): Promise<OptimizedImage> {
  const pipeline = sharp(input, { failOn: "truncated" }).rotate();
  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Impossible de lire les dimensions de l'image");
  }

  const mainBuffer = await sharp(input)
    .rotate()
    .resize({
      width: IMAGE_CONFIG.maxDimension,
      height: IMAGE_CONFIG.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_CONFIG.mainQuality, effort: 4 })
    .toBuffer();

  const thumbnailBuffer = await sharp(input)
    .rotate()
    .resize({
      width: IMAGE_CONFIG.thumbnailSize,
      height: IMAGE_CONFIG.thumbnailSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_CONFIG.thumbnailQuality, effort: 4 })
    .toBuffer();

  return {
    mainBuffer,
    thumbnailBuffer,
    width: metadata.width,
    height: metadata.height,
    contentType: "image/webp",
  };
}

// ==================== VALIDATE + UPLOAD HELPER ====================

export interface UploadedImageResult {
  /** Public URL of the optimized main image */
  url: string;
  /** Public URL of the thumbnail */
  thumbnailUrl: string;
  /** Dimensions of the source image */
  width: number;
  /** Dimensions of the source image */
  height: number;
  /** Byte size of the optimized main image */
  size: number;
}

/**
 * Validate an image buffer (size + magic bytes), optimize it via sharp,
 * and upload both the main WebP and a thumbnail to R2.
 *
 * Throws on validation failure. Callers should translate to HTTP responses.
 */
export async function validateOptimizeAndUpload(
  input: Buffer,
  originalName: string,
  folder?: R2Folder
): Promise<UploadedImageResult> {
  if (input.length === 0) {
    throw new Error("Fichier vide");
  }

  if (input.length > IMAGE_CONFIG.maxUploadBytes) {
    throw new Error(
      `Fichier trop volumineux. Maximum ${Math.floor(IMAGE_CONFIG.maxUploadBytes / (1024 * 1024))} MB.`
    );
  }

  const detectedMime = detectImageMime(input);
  if (!detectedMime) {
    throw new Error(
      "Type de fichier non reconnu. Utilisez JPG, PNG, WebP, GIF ou AVIF."
    );
  }

  let optimized: OptimizedImage;
  try {
    optimized = await optimizeImage(input);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    uploadLogger.error(`sharp optimization failed for ${originalName}: ${msg}`);
    throw new Error("Image invalide ou corrompue");
  }

  const baseName = originalName.replace(/\.[^.]+$/, "") || "image";
  const mainName = `${baseName}.webp`;
  const thumbName = `${baseName}-thumb.webp`;

  const [url, thumbnailUrl] = await Promise.all([
    uploadToR2(optimized.mainBuffer, mainName, "image/webp", folder),
    uploadToR2(optimized.thumbnailBuffer, thumbName, "image/webp", folder),
  ]);

  uploadLogger.info(
    `image uploaded folder=${folder ?? "root"} name=${originalName} mime=${detectedMime} ` +
      `dims=${optimized.width}x${optimized.height} ` +
      `optimized=${optimized.mainBuffer.length}B thumb=${optimized.thumbnailBuffer.length}B`
  );

  return {
    url,
    thumbnailUrl,
    width: optimized.width,
    height: optimized.height,
    size: optimized.mainBuffer.length,
  };
}
