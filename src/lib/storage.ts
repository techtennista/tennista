import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.NEON_STORAGE_BUCKET ?? "tennista-media";

function storageConfig() {
  const endpoint = process.env.NEON_STORAGE_ENDPOINT;
  const accessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Neon Storage credentials are not configured.");
  }
  return { endpoint, accessKeyId, secretAccessKey };
}

function client() {
  const config = storageConfig();
  return new S3Client({
    endpoint: config.endpoint,
    region: process.env.NEON_STORAGE_REGION ?? "us-east-2",
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function createUploadUrl({
  objectKey,
  contentType,
}: {
  objectKey: string;
  contentType: string;
}) {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 5 },
  );
}

export function publicAssetUrl(objectKey: string) {
  if (objectKey.startsWith("/")) return objectKey;
  const { endpoint } = storageConfig();
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
  return `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(bucket)}/${encodedKey}`;
}

export const mediaBucket = bucket;
