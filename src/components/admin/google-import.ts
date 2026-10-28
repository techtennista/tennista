export type ImportedAsset = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  url: string;
};

type ImportItem = {
  id: string;
  source: "photos" | "drive";
  filename: string;
  downloadUrl?: string;
  fileId?: string;
  width?: number;
  height?: number;
};

export async function importGoogleMedia({
  url,
  title,
  createGallery = false,
  onProgress,
}: {
  url: string;
  title?: string;
  createGallery?: boolean;
  onProgress?: (imported: number, total: number) => void;
}) {
  const resolvedResponse = await fetch("/api/admin/media/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resolve", url, title }),
  });
  const resolved = (await resolvedResponse.json()) as {
    message?: string;
    title?: string;
    source?: string;
    total?: number;
    items?: ImportItem[];
  };
  if (!resolvedResponse.ok || !resolved.items?.length) {
    throw new Error(resolved.message ?? "Unable to read that Google link.");
  }

  const assets: ImportedAsset[] = [];
  const failures: string[] = [];
  let galleryId: string | null = null;
  const items = resolved.items;
  const batchTitle = title?.trim() || resolved.title || "Imported media";

  for (let index = 0; index < items.length; index += 4) {
    onProgress?.(assets.length, items.length);
    const ingestResponse = await fetch("/api/admin/media/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ingest",
        items: items.slice(index, index + 4),
        title: batchTitle,
        createGallery,
        galleryId,
        source: resolved.source,
      }),
    });
    const ingested = (await ingestResponse.json()) as {
      message?: string;
      assets?: ImportedAsset[];
      failures?: string[];
      galleryId?: string | null;
    };
    if (!ingestResponse.ok) {
      throw new Error(ingested.message ?? "Import failed partway through.");
    }
    assets.push(...(ingested.assets ?? []));
    failures.push(...(ingested.failures ?? []));
    galleryId = ingested.galleryId ?? galleryId;
  }

  onProgress?.(assets.length, items.length);
  if (!assets.length) {
    throw new Error(failures[0] ?? "Google did not return any importable photos or videos.");
  }

  return {
    title: batchTitle,
    source: resolved.source ?? "",
    total: items.length,
    assets,
    failures,
    galleryId,
  };
}
