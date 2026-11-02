export type EmbedProvider = "youtube" | "vimeo";

export function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractYoutubeId(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com") {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] || null;
      }
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || null;
      }
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function extractVimeoId(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com" && !host.endsWith(".vimeo.com")) return null;
    const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function videoEmbedUrl(provider: EmbedProvider, externalUrl: string) {
  if (provider === "youtube") {
    const id = extractYoutubeId(externalUrl);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  const id = extractVimeoId(externalUrl);
  return id ? `https://player.vimeo.com/video/${id}` : null;
}

export function youtubeThumbnailUrl(externalUrl: string) {
  const id = extractYoutubeId(externalUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
