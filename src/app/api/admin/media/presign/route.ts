import path from "node:path";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/admin-session";
import { createUploadUrl, mediaBucket, publicAssetUrl } from "@/lib/storage";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

function maxBytes(contentType: string) {
  if (contentType.startsWith("video/")) return 500 * 1024 * 1024;
  return 25 * 1024 * 1024;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ message: "Unauthorised." }, { status: 401 });

  const body = (await request.json()) as {
    fileName?: unknown;
    contentType?: unknown;
    byteSize?: unknown;
  };
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const contentType = typeof body.contentType === "string" ? body.contentType.trim().toLowerCase() : "";
  const byteSize = typeof body.byteSize === "number" ? body.byteSize : 0;

  if (!fileName || !allowedTypes.has(contentType)) {
    return Response.json({ message: "This file type is not supported." }, { status: 422 });
  }
  if (!Number.isSafeInteger(byteSize) || byteSize <= 0 || byteSize > maxBytes(contentType)) {
    return Response.json({ message: "The file exceeds the upload size limit." }, { status: 422 });
  }

  const extension = path.extname(fileName).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 10);
  const now = new Date();
  const objectKey = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}${extension}`;

  try {
    const uploadUrl = await createUploadUrl({ objectKey, contentType });
    return Response.json({
      uploadUrl,
      objectKey,
      bucket: mediaBucket,
      publicUrl: publicAssetUrl(objectKey),
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Unable to create media upload URL", error);
    return Response.json({ message: "Media storage is not configured yet." }, { status: 503 });
  }
}
