import "server-only";

import JSON5 from "json5";
import * as GooglePhotosAlbum from "google-photos-album-image-url-fetch";

const PHOTO_MAX_EDGE = 1600;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

export type GoogleSource =
  | { kind: "photos-album"; url: string }
  | { kind: "drive-file"; fileId: string }
  | { kind: "drive-folder"; folderId: string };

export type ImportItem = {
  id: string;
  source: "photos" | "drive";
  filename: string;
  downloadUrl?: string;
  fileId?: string;
  width?: number;
  height?: number;
};

export type DownloadedMedia = {
  bytes: Buffer;
  mimeType: string;
  filename: string;
  width: number | null;
  height: number | null;
};

export function parseGoogleMediaUrl(value: string): GoogleSource | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");

    if (host === "photos.app.goo.gl" || host === "photos.google.com") {
      return { kind: "photos-album", url: url.toString() };
    }

    if (
      host !== "drive.google.com" &&
      host !== "docs.google.com" &&
      host !== "drive.usercontent.google.com"
    ) {
      return null;
    }

    const fileMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) return { kind: "drive-file", fileId: fileMatch[1] };

    const folderMatch = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch?.[1]) return { kind: "drive-folder", folderId: folderMatch[1] };

    const id = url.searchParams.get("id");
    if (id && /\/folders\//.test(url.pathname)) return { kind: "drive-folder", folderId: id };
    if (id) return { kind: "drive-file", fileId: id };
    return null;
  } catch {
    return null;
  }
}

export async function resolveGoogleMedia(url: string): Promise<{
  source: GoogleSource;
  title: string;
  items: ImportItem[];
}> {
  const parsed = parseGoogleMediaUrl(url);
  if (!parsed) {
    throw new GoogleMediaError(
      "Paste a public Google Drive file, folder, or Google Photos album link.",
    );
  }

  if (parsed.kind === "photos-album") {
    const albumUrl = await resolvePhotosAlbumUrl(parsed.url);
    const photos = await listPhotosAlbum(albumUrl);
    if (!photos.length) {
      throw new GoogleMediaError(
        "No photos were found in that album. In Google Photos, open Share → General access and set it to “Anyone with the link”, then try again.",
      );
    }
    return {
      source: { kind: "photos-album", url: albumUrl },
      title: titleFromUrl(albumUrl, "Google Photos album"),
      items: photos.map((photo, index) => {
        const { downloadUrl, width, height } = sizedPhoto(photo);
        return {
          id: photo.uid || `photo-${index}`,
          source: "photos" as const,
          filename: `photo-${String(index + 1).padStart(3, "0")}.jpg`,
          downloadUrl,
          width,
          height,
        };
      }),
    };
  }

  if (parsed.kind === "drive-file") {
    return {
      source: parsed,
      title: "Google Drive file",
      items: [
        {
          id: parsed.fileId,
          source: "drive",
          filename: `drive-${parsed.fileId}`,
          fileId: parsed.fileId,
        },
      ],
    };
  }

  const files = await listDriveFolder(parsed.folderId);
  if (!files.length) {
    throw new GoogleMediaError(
      "No files were found in that Drive folder. Share the folder as “Anyone with the link”.",
    );
  }
  return {
    source: parsed,
    title: "Google Drive folder",
    items: files,
  };
}

export async function downloadImportItem(item: ImportItem): Promise<DownloadedMedia> {
  if (item.source === "photos" && item.downloadUrl) {
    const response = await fetch(item.downloadUrl, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(30_000),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new GoogleMediaError(`Google Photos download failed (${response.status}).`);
    }
    return finalizeDownload(response, item.filename, item.width ?? null, item.height ?? null);
  }

  if (item.source === "drive" && item.fileId) {
    const response = await downloadDriveFile(item.fileId);
    return finalizeDownload(response, item.filename, null, null);
  }

  throw new GoogleMediaError("That import item is missing a download source.");
}

export class GoogleMediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleMediaError";
  }
}

function sizedPhoto(photo: { url: string; width: number; height: number }) {
  const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(photo.width || PHOTO_MAX_EDGE, photo.height || PHOTO_MAX_EDGE));
  const width = Math.max(1, Math.round((photo.width || PHOTO_MAX_EDGE) * scale));
  const height = Math.max(1, Math.round((photo.height || PHOTO_MAX_EDGE) * scale));
  return {
    downloadUrl: `${photo.url}=w${width}-h${height}`,
    width,
    height,
  };
}

async function resolvePhotosAlbumUrl(url: string) {
  if (url.includes("photos.google.com/share") || url.includes("photos.google.com/album")) {
    return url;
  }
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": BROWSER_UA },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  return response.url || url;
}

async function listPhotosAlbum(albumUrl: string) {
  const fromHtml = await listPhotosFromHtml(albumUrl);
  if (fromHtml.length) return fromHtml;
  try {
    const fetchImageUrls =
      GooglePhotosAlbum.fetchImageUrls ??
      (GooglePhotosAlbum as { default?: { fetchImageUrls?: typeof GooglePhotosAlbum.fetchImageUrls } }).default
        ?.fetchImageUrls;
    const photos = (await fetchImageUrls?.(albumUrl)) ?? [];
    return photos.filter((photo) => photo?.url);
  } catch {
    return [];
  }
}

async function listPhotosFromHtml(albumUrl: string) {
  const response = await fetch(albumUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return [];
  const html = await response.text();
  const structured = parsePhotosFromInitData(html);
  if (structured.length) return structured;
  return parsePhotosFromRawUrls(html);
}

function parsePhotosFromInitData(html: string) {
  const blocks = [...html.matchAll(/(?<=AF_initDataCallback\()(?=.*data)(\{[\s\S]*?)(\);<\/script>)/g)]
    .map((match) => match[1])
    .sort((a, b) => b.length - a.length);
  const photos: Array<{ uid: string; url: string; width: number; height: number }> = [];
  for (const block of blocks) {
    try {
      const parsed = JSON5.parse(block) as { data?: unknown };
      collectPhotoEntries(parsed.data, photos);
    } catch {
      // Try the next init-data blob.
    }
  }
  return uniquePhotos(photos);
}

function collectPhotoEntries(
  value: unknown,
  photos: Array<{ uid: string; url: string; width: number; height: number }>,
) {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 6 &&
    typeof value[0] === "string" &&
    Array.isArray(value[1]) &&
    typeof value[1][0] === "string" &&
    value[1][0].includes("googleusercontent.com") &&
    typeof value[1][1] === "number" &&
    typeof value[1][2] === "number"
  ) {
    photos.push({
      uid: value[0],
      url: value[1][0],
      width: value[1][1],
      height: value[1][2],
    });
    return;
  }
  for (const child of value) collectPhotoEntries(child, photos);
}

function parsePhotosFromRawUrls(html: string) {
  const urls = [...html.matchAll(/https:\/\/lh3\.googleusercontent\.com\/[^\s"'\\=]+/g)].map((match) => match[0]);
  return uniquePhotos(
    urls.map((url, index) => ({
      uid: `photo-${index + 1}`,
      url: url.replace(/=w\d+-h\d+.*$/, ""),
      width: PHOTO_MAX_EDGE,
      height: PHOTO_MAX_EDGE,
    })),
  );
}

function uniquePhotos(photos: Array<{ uid: string; url: string; width: number; height: number }>) {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    const key = photo.url.replace(/=w\d+-h\d+.*$/, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function listDriveFolder(folderId: string): Promise<ImportItem[]> {
  const response = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`, {
    headers: { "User-Agent": BROWSER_UA },
    signal: AbortSignal.timeout(20_000),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new GoogleMediaError("Google Drive could not open that folder.");
  }
  const html = await response.text();
  const items = new Map<string, ImportItem>();
  const filePattern = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)[^"'<\s]*["'][^>]*>([^<]+)</gi;
  for (const match of html.matchAll(filePattern)) {
    const fileId = match[1];
    const filename = decodeHtml(match[2]).trim() || `drive-${fileId}`;
    if (!items.has(fileId)) {
      items.set(fileId, {
        id: fileId,
        source: "drive",
        filename,
        fileId,
      });
    }
  }
  if (items.size) return [...items.values()];

  const idPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/g;
  for (const match of html.matchAll(idPattern)) {
    const fileId = match[1];
    if (!items.has(fileId)) {
      items.set(fileId, {
        id: fileId,
        source: "drive",
        filename: `drive-${fileId}`,
        fileId,
      });
    }
  }
  return [...items.values()];
}

async function downloadDriveFile(fileId: string): Promise<Response> {
  const candidates = [
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
  ];

  let lastHtml = "";
  for (const url of candidates) {
    const response = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
    });
    const mime = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (response.ok && mime && !mime.includes("text/html")) return response;
    lastHtml = await response.text();
    const confirmed = confirmUrlFromHtml(lastHtml, fileId);
    if (confirmed) {
      const retry = await fetch(confirmed, {
        headers: { "User-Agent": BROWSER_UA },
        redirect: "follow",
        signal: AbortSignal.timeout(45_000),
      });
      const retryMime = retry.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
      if (retry.ok && retryMime && !retryMime.includes("text/html")) return retry;
      lastHtml = await retry.text();
    }
  }

  if (/accounts\.google|Sign in|you need access/i.test(lastHtml)) {
    throw new GoogleMediaError(
      "Google is asking for a sign-in. Share the file as “Anyone with the link can view”.",
    );
  }
  throw new GoogleMediaError(
    "Google Drive blocked the download. Share the file publicly and try again.",
  );
}

function confirmUrlFromHtml(html: string, fileId: string) {
  const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
  const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] ?? html.match(/confirm=([0-9A-Za-z_]+)/)?.[1];
  if (uuid) {
    const params = new URLSearchParams({
      id: fileId,
      export: "download",
      confirm: confirm || "t",
      uuid,
    });
    return `https://drive.usercontent.google.com/download?${params}`;
  }
  if (confirm) {
    return `https://drive.google.com/uc?export=download&confirm=${confirm}&id=${fileId}`;
  }
  return null;
}

async function finalizeDownload(
  response: Response,
  fallbackName: string,
  width: number | null,
  height: number | null,
): Promise<DownloadedMedia> {
  const headerMime = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  const filename = filenameFromDisposition(response.headers.get("content-disposition")) || fallbackName;
  const length = Number(response.headers.get("content-length") || 0);
  const hintedMime = mimeFromFilename(filename) || headerMime;
  const limit = hintedMime.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (length > limit) {
    throw new GoogleMediaError(
      hintedMime.startsWith("video/")
        ? "That video is larger than 80 MB. Upload the file directly or host it on YouTube."
        : "That file is larger than 25 MB.",
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > limit) {
    throw new GoogleMediaError(
      hintedMime.startsWith("video/")
        ? "That video is larger than 80 MB. Upload the file directly or host it on YouTube."
        : "That file is larger than 25 MB.",
    );
  }

  const sniff = sniffMime(bytes) || hintedMime;
  const mimeType = ALLOWED_TYPES.has(sniff) ? sniff : "";
  if (!mimeType) {
    throw new GoogleMediaError(
      "Only images and videos can be imported from Google Drive or Google Photos.",
    );
  }

  return {
    bytes,
    mimeType,
    filename: ensureExtension(filename, mimeType),
    width,
    height,
  };
}

function filenameFromDisposition(value: string | null) {
  if (!value) return "";
  const utf = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf) return decodeURIComponent(utf).replace(/["']/g, "");
  const plain = value.match(/filename="?([^";]+)"?/i)?.[1];
  return plain?.trim() ?? "";
}

function mimeFromFilename(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "";
}

function sniffMime(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 4 && bytes.toString("ascii", 0, 4) === "GIF8") return "image/gif";
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") return "video/mp4";
  if (bytes.length >= 4 && bytes.toString("ascii", 0, 4) === "\x1aE\xdf\xa3") return "video/webm";
  return "";
}

function ensureExtension(filename: string, mimeType: string) {
  const clean = filename.replace(/[^\w.\- ()]+/g, "-").replace(/^-+|-+$/g, "") || "media";
  if (clean.includes(".")) return clean.slice(0, 120);
  const ext =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : mimeType === "image/gif"
          ? "gif"
          : mimeType === "image/svg+xml"
            ? "svg"
            : mimeType === "video/webm"
              ? "webm"
              : mimeType === "video/quicktime"
                ? "mov"
                : mimeType.startsWith("video/")
                  ? "mp4"
                  : "jpg";
  return `${clean}.${ext}`;
}

function titleFromUrl(url: string, fallback: string) {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").filter(Boolean).at(-1);
    return last ? decodeURIComponent(last).replace(/[-_]+/g, " ") : fallback;
  } catch {
    return fallback;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
