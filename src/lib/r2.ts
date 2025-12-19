import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "althea-images";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder?: string
): Promise<string> {
  // Nettoyer le nom de fichier (retirer emojis/caractères spéciaux)
  const cleanFileName = fileName.replace(/[^\w.-]/g, '_');
  const timestamp = Date.now();
  const key = folder
    ? `${folder}/${timestamp}-${cleanFileName}`
    : `${timestamp}-${cleanFileName}`;

  console.log(`[R2] Uploading file to: ${key}`);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`[R2] Upload successful: ${url}`);

  return url;
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.split("/").pop();
  if (!key) return;

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export { R2_PUBLIC_URL, R2_BUCKET_NAME };
