import "server-only";

import { randomUUID } from "node:crypto";
import { extractVimeoId, extractYoutubeId, youtubeThumbnailUrl } from "@/lib/video-providers";
import { mediaBucket, putMediaObject } from "@/lib/storage";

type DbClient = {
  query: <T = unknown>(
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: T[]; rowCount: number | null }>;
};

async function vimeoThumbnailUrl(externalUrl: string) {
  const id = extractVimeoId(externalUrl);
  if (!id) return null;
  const response = await fetch(
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { thumbnail_url?: string };
  return data.thumbnail_url || null;
}

export async function ensureProviderThumbnailAsset({
  client,
  provider,
  externalUrl,
  title,
  uploadedBy,
}: {
  client: DbClient;
  provider: "youtube" | "vimeo" | "upload";
  externalUrl: string | null;
  title: string;
  uploadedBy: string;
}) {
  if (!externalUrl || (provider !== "youtube" && provider !== "vimeo")) return null;

  const sourceUrl =
    provider === "youtube"
      ? youtubeThumbnailUrl(externalUrl)
      : await vimeoThumbnailUrl(externalUrl);
  if (!sourceUrl) return null;

  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });
  if (!response.ok) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  if (!mimeType.startsWith("image/")) return null;

  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const now = new Date();
  const providerId =
    provider === "youtube" ? extractYoutubeId(externalUrl) : extractVimeoId(externalUrl);
  const objectKey = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${extension}`;
  await putMediaObject({
    objectKey,
    body: bytes,
    contentType: mimeType,
    contentLength: bytes.byteLength,
  });

  const result = await client.query<{ id: string }>(
    `
      INSERT INTO cms_assets (
        bucket, object_key, original_name, mime_type, byte_size, width, height,
        alt_text, caption, status, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, NULL, NULL, $6, $7, 'ready', $8)
      RETURNING id
    `,
    [
      mediaBucket,
      objectKey,
      `${provider}-thumb-${providerId || "video"}.${extension}`,
      mimeType,
      bytes.byteLength,
      `${title} thumbnail`,
      `Auto-imported from ${provider}`,
      uploadedBy,
    ],
  );
  return result.rows[0]?.id ?? null;
}
