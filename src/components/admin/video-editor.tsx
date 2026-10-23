"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryAssetOption } from "@/components/admin/gallery-editor";

export type EditableVideo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  provider: "youtube" | "vimeo";
  externalUrl: string;
  thumbnailAssetId: string;
  status: string;
  publishedAt: string;
};

const fieldClass =
  "mt-2 w-full rounded-[0.65rem] border border-blue/15 bg-white px-4 py-3 text-sm text-blue outline-none transition focus:border-blue-bright";

export function VideoEditor({
  assets,
  video,
  canPublish,
}: {
  assets: GalleryAssetOption[];
  video?: EditableVideo;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(video?.title ?? "");
  const [slug, setSlug] = useState(video?.slug ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [provider, setProvider] = useState<"youtube" | "vimeo">(video?.provider ?? "youtube");
  const [externalUrl, setExternalUrl] = useState(video?.externalUrl ?? "");
  const [thumbnailAssetId, setThumbnailAssetId] = useState(video?.thumbnailAssetId ?? "");
  const [status, setStatus] = useState(video?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    video?.publishedAt ? video.publishedAt.slice(0, 16) : "",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    if (!title.trim() || !externalUrl.trim()) {
      setMessage("Add a title and provider URL before saving.");
      return;
    }
    setSaving(true);
    setMessage("");
    const response = await fetch(video ? `/api/admin/videos/${video.id}` : "/api/admin/videos", {
      method: video ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        description,
        provider,
        externalUrl,
        thumbnailAssetId: thumbnailAssetId || null,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error ?? "The video could not be saved.");
      return;
    }
    router.push("/admin/videos");
    router.refresh();
  }

  async function remove() {
    if (!video || !window.confirm("Delete this video entry? The thumbnail asset will be kept.")) {
      return;
    }
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/videos/${video.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setSaving(false);
      setMessage(result.error ?? "The video could not be deleted.");
      return;
    }
    router.push("/admin/videos");
    router.refresh();
  }

  const thumbnail = assets.find((asset) => asset.id === thumbnailAssetId);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <section className="rounded-[1rem] border border-blue/10 bg-white p-5 sm:p-7">
          <label className="block text-sm font-bold text-blue">
            Video title
            <input
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!video && !slug) {
                  setSlug(
                    nextTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              className={`${fieldClass} text-lg font-bold`}
              placeholder="Video title"
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-blue">
            URL slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={fieldClass}
              placeholder="video-url-slug"
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-blue">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} min-h-36 resize-y`}
              placeholder="Describe this video."
            />
          </label>
        </section>

        <section className="rounded-[1rem] border border-blue/10 bg-white p-5 sm:p-7">
          <h2 className="headline text-[1.5rem] leading-none text-blue">Video source</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray">
            Paste a standard provider URL or an embed URL. Only HTTPS YouTube and Vimeo links are accepted.
          </p>
          <label className="mt-5 block text-sm font-bold text-blue">
            Provider
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value as "youtube" | "vimeo")}
              className={fieldClass}
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </label>
          <label className="mt-5 block text-sm font-bold text-blue">
            Provider or embed URL
            <input
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              className={fieldClass}
              placeholder={
                provider === "youtube"
                  ? "https://www.youtube.com/watch?v=…"
                  : "https://vimeo.com/…"
              }
            />
          </label>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-[1rem] border border-blue/10 bg-white p-5">
          <h2 className="font-bold text-blue">Publishing</h2>
          <label className="mt-4 block text-sm font-bold text-blue">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={fieldClass}
            >
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              {canPublish ? <option value="published">Published</option> : null}
              {canPublish ? <option value="archived">Archived</option> : null}
            </select>
          </label>
          {canPublish ? (
            <label className="mt-4 block text-sm font-bold text-blue">
              Publish date
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                className={fieldClass}
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-5 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-50"
          >
            {saving ? "Saving…" : video ? "Save changes" : "Create video"}
          </button>
          {message ? <p className="mt-3 text-sm font-medium text-red-600">{message}</p> : null}
        </section>

        <section className="rounded-[1rem] border border-blue/10 bg-white p-5">
          <h2 className="font-bold text-blue">Thumbnail</h2>
          {thumbnail ? (
            <img
              src={thumbnail.publicUrl}
              alt=""
              className="mt-4 aspect-video w-full rounded-[0.65rem] object-cover"
            />
          ) : null}
          <select
            value={thumbnailAssetId}
            onChange={(event) => setThumbnailAssetId(event.target.value)}
            className={fieldClass}
            aria-label="Thumbnail image"
          >
            <option value="">No thumbnail</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.filename}
              </option>
            ))}
          </select>
        </section>

        {video && canPublish ? (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="w-full cursor-pointer rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete video
          </button>
        ) : null}
      </aside>
    </div>
  );
}
