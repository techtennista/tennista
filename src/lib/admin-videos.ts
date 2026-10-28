import { isUuid, normalizeSlug, optionalText, parseContentStatus, parsePublishedAt } from "@/lib/admin-content";

export const VIDEO_PROVIDERS = ["youtube", "vimeo", "upload"] as const;

export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export type ParsedVideoInput = {
  title: string;
  slug: string;
  description: string | null;
  provider: VideoProvider;
  externalUrl: string | null;
  videoAssetId: string | null;
  thumbnailAssetId: string | null;
  status: NonNullable<ReturnType<typeof parseContentStatus>>;
  publishedAt: Date | null;
};

export function parseVideoProvider(value: unknown): VideoProvider | null {
  return VIDEO_PROVIDERS.includes(value as VideoProvider) ? (value as VideoProvider) : null;
}

export function parseProviderUrl(value: unknown, provider: VideoProvider | null) {
  if (!provider || provider === "upload" || typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const valid =
      provider === "youtube"
        ? ["youtube.com", "youtu.be", "youtube-nocookie.com"].some(
            (domain) => host === domain || host.endsWith(`.${domain}`),
          )
        : host === "vimeo.com" || host.endsWith(".vimeo.com");
    return valid ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseVideoInput(payload: Record<string, unknown>): ParsedVideoInput | { error: string; status: number } {
  const title = String(payload.title ?? "").trim();
  const slug = normalizeSlug(String(payload.slug || title));
  const provider = parseVideoProvider(payload.provider);
  const status = parseContentStatus(payload.status);
  const thumbnailAssetId = payload.thumbnailAssetId ? String(payload.thumbnailAssetId) : null;
  const videoAssetId = payload.videoAssetId ? String(payload.videoAssetId) : null;
  if (!title || !slug) return { error: "Title and slug are required.", status: 400 };
  if (!provider || !status) return { error: "Invalid video provider or status.", status: 400 };
  if (thumbnailAssetId && !isUuid(thumbnailAssetId)) return { error: "Invalid thumbnail asset.", status: 400 };
  if (videoAssetId && !isUuid(videoAssetId)) return { error: "Invalid video file.", status: 400 };

  const externalUrl = parseProviderUrl(payload.externalUrl, provider);
  if (provider !== "upload" && !externalUrl) {
    return { error: "Add a valid HTTPS YouTube or Vimeo URL for the selected provider.", status: 400 };
  }
  if (provider === "upload" && !videoAssetId) {
    return { error: "Import a Google Drive video or choose an uploaded video file.", status: 400 };
  }

  const publishedAt = parsePublishedAt(payload.publishedAt, status);
  if (status === "published" && !publishedAt) return { error: "Invalid publish date.", status: 400 };

  return {
    title,
    slug,
    description: optionalText(payload.description),
    provider,
    externalUrl: provider === "upload" ? null : externalUrl,
    videoAssetId: provider === "upload" ? videoAssetId : null,
    thumbnailAssetId,
    status,
    publishedAt,
  };
}
