"use client";

import { useCallback, useEffect, useState } from "react";

type Asset = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  status: string;
  url: string;
  createdAt: string;
};

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function imageDimensions(file: File) {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return { width: null, height: null };
  }
}

export function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const loadAssets = useCallback(async () => {
    const response = await fetch("/api/admin/media");
    const data = (await response.json()) as { assets?: Asset[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? "Unable to load media.");
    setAssets(data.assets ?? []);
  }, []);

  useEffect(() => {
    loadAssets().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Unable to load media.");
    });
  }, [loadAssets]);

  return (
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <form
        className="rounded-[1rem] border border-blue/10 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!file) return;
          if (file.type.startsWith("image/") && !altText.trim()) {
            setMessage("Add alt text before uploading an image.");
            return;
          }

          setPending(true);
          setMessage("");
          try {
            const presignResponse = await fetch("/api/admin/media/presign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                byteSize: file.size,
              }),
            });
            const presign = (await presignResponse.json()) as {
              uploadUrl?: string;
              objectKey?: string;
              message?: string;
            };
            if (!presignResponse.ok || !presign.uploadUrl || !presign.objectKey) {
              throw new Error(presign.message ?? "Unable to prepare upload.");
            }

            const uploadResponse = await fetch(presign.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!uploadResponse.ok) throw new Error("The file upload failed.");

            const dimensions = await imageDimensions(file);
            const saveResponse = await fetch("/api/admin/media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                objectKey: presign.objectKey,
                originalName: file.name,
                mimeType: file.type,
                byteSize: file.size,
                ...dimensions,
                altText,
                caption,
              }),
            });
            const saved = (await saveResponse.json()) as { message?: string };
            if (!saveResponse.ok) throw new Error(saved.message ?? "Unable to save media.");

            setFile(null);
            setAltText("");
            setCaption("");
            setMessage("Original file uploaded successfully.");
            const input = event.currentTarget.elements.namedItem("asset") as HTMLInputElement | null;
            if (input) input.value = "";
            await loadAssets();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to upload media.");
          } finally {
            setPending(false);
          }
        }}
      >
        <h2 className="headline text-[1.5rem] leading-none text-blue">Upload original</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray">
          Images are stored exactly as uploaded. Images may be up to 25 MB and videos up to 500 MB.
        </p>
        <label className="mt-5 block">
          <span className="text-sm font-bold text-blue">File</span>
          <input
            name="asset"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full cursor-pointer rounded-[0.65rem] border border-blue/15 bg-blue-tint p-3 text-sm text-gray file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-blue file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-blue">Alt text</span>
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Describe what is shown"
            className="mt-2 h-11 w-full rounded-[0.65rem] border border-blue/15 px-3 text-sm text-gray outline-none focus:border-blue-bright"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-blue">Caption</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded-[0.65rem] border border-blue/15 px-3 py-2 text-sm text-gray outline-none focus:border-blue-bright"
          />
        </label>
        <button
          type="submit"
          disabled={!file || pending}
          className="mt-5 h-11 cursor-pointer rounded-full bg-lime px-6 text-sm font-bold text-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload file"}
        </button>
        <p aria-live="polite" className="mt-4 min-h-5 text-sm font-medium text-blue">
          {message}
        </p>
      </form>

      <section className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h2 className="headline text-[1.5rem] leading-none text-blue">Media library</h2>
          <span className="text-sm font-semibold text-gray">{assets.length} assets</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-[1rem] border border-blue/10 bg-white">
              {asset.mimeType.startsWith("image/") ? (
                <img src={asset.url} alt={asset.altText ?? ""} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-blue-tint px-5 text-center text-sm font-bold text-blue">
                  {asset.mimeType.startsWith("video/") ? "Video file" : "Document"}
                </div>
              )}
              <div className="p-4">
                <h3 className="truncate text-sm font-bold text-blue">{asset.originalName}</h3>
                <p className="mt-2 text-xs text-gray">
                  {fileSize(asset.byteSize)}
                  {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                </p>
                {asset.caption ? <p className="mt-3 text-sm leading-relaxed text-gray">{asset.caption}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
