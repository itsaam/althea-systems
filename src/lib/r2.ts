import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

// ---- Configuration ----

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "althea-images";
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ||
  "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ---- Valid folders ----

export const R2_FOLDERS = [
  "products",
  "categories",
  "carousel",
  "users",
] as const;

export type R2Folder = (typeof R2_FOLDERS)[number];

// ---- Helpers ----

/**
 * Generate a unique key for a file using UUID.
 * Format: {folder}/{uuid}{extension}
 */
function generateKey(originalName: string, folder?: R2Folder): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const uuid = randomUUID();
  return folder ? `${folder}/${uuid}${ext}` : `${uuid}${ext}`;
}

/**
 * Extract the R2 object key from a full public URL.
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) return null;
  const key = url.replace(`${R2_PUBLIC_URL}/`, "");
  return key || null;
}

// ---- Upload ----

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder?: string
): Promise<string> {
  const validFolder = R2_FOLDERS.includes(folder as R2Folder)
    ? (folder as R2Folder)
    : undefined;

  const key = generateKey(fileName, validFolder);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

// ---- Download ----

export interface R2DownloadResult {
  body: ReadableStream | null;
  contentType: string;
  contentLength: number;
}

export async function downloadFromR2(
  key: string
): Promise<R2DownloadResult | null> {
  try {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    return {
      body: (response.Body as ReadableStream) ?? null,
      contentType: response.ContentType || "application/octet-stream",
      contentLength: response.ContentLength || 0,
    };
  } catch {
    return null;
  }
}

// ---- Head (metadata) ----

export async function headObjectR2(
  key: string
): Promise<{ contentType: string; contentLength: number } | null> {
  try {
    const response = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return {
      contentType: response.ContentType || "application/octet-stream",
      contentLength: response.ContentLength || 0,
    };
  } catch {
    return null;
  }
}

// ---- Delete ----

export async function deleteFromR2(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Delete an object by its key directly (not URL).
 */
export async function deleteFromR2ByKey(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export { R2_PUBLIC_URL, R2_BUCKET_NAME };
