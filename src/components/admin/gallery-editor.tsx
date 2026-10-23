"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type GalleryAssetOption = {
  id: string;
  filename: string;
  publicUrl: string;
};

type GalleryItem = {
  key: string;
  assetId: string;
  caption: string;
};

export type EditableGallery = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverAssetId: string;
  status: string;
  publishedAt: string;
  items: Array<{ assetId: string; caption: string }>;
};

const fieldClass =
  "mt-2 w-full rounded-[0.65rem] border border-blue/15 bg-white px-4 py-3 text-sm text-blue outline-none transition focus:border-blue-bright";

export function GalleryEditor({
  assets,
  gallery,
  canPublish,
}: {
  assets: GalleryAssetOption[];
  gallery?: EditableGallery;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(gallery?.title ?? "");
  const [slug, setSlug] = useState(gallery?.slug ?? "");
  const [description, setDescription] = useState(gallery?.description ?? "");
  const [coverAssetId, setCoverAssetId] = useState(gallery?.coverAssetId ?? "");
  const [status, setStatus] = useState(gallery?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    gallery?.publishedAt ? gallery.publishedAt.slice(0, 16) : "",
  );
  const [items, setItems] = useState<GalleryItem[]>(
    gallery?.items.map((item) => ({ ...item, key: crypto.randomUUID() })) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateItem(key: string, updates: Partial<GalleryItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...updates } : item)),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    if (!title.trim()) {
      setMessage("Add a title before saving.");
      return;
    }
    if (items.some((item) => !item.assetId)) {
      setMessage("Choose an image for every gallery item.");
      return;
    }
    if (new Set(items.map((item) => item.assetId)).size !== items.length) {
      setMessage("Each image can appear only once in a gallery.");
      return;
    }

    setSaving(true);
    setMessage("");
    const response = await fetch(
      gallery ? `/api/admin/galleries/${gallery.id}` : "/api/admin/galleries",
      {
        method: gallery ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          coverAssetId: coverAssetId || null,
          status,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
          items: items.map(({ assetId, caption }) => ({ assetId, caption })),
        }),
      },
    );
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error ?? "The gallery could not be saved.");
      return;
    }
    router.push("/admin/galleries");
    router.refresh();
  }

  async function remove() {
    if (!gallery || !window.confirm("Delete this gallery? The media assets will be kept.")) return;
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/galleries/${gallery.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setSaving(false);
      setMessage(result.error ?? "The gallery could not be deleted.");
      return;
    }
    router.push("/admin/galleries");
    router.refresh();
  }

  const coverAsset = assets.find((asset) => asset.id === coverAssetId);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <section className="rounded-[1rem] border border-blue/10 bg-white p-5 sm:p-7">
          <label className="block text-sm font-bold text-blue">
            Gallery title
            <input
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!gallery && !slug) {
                  setSlug(
                    nextTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              className={`${fieldClass} text-lg font-bold`}
              placeholder="Gallery title"
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-blue">
            URL slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={fieldClass}
              placeholder="gallery-url-slug"
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-blue">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} min-h-28 resize-y`}
              placeholder="Describe this collection."
            />
          </label>
        </section>

        <section className="rounded-[1rem] border border-blue/10 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="headline text-[1.5rem] leading-none text-blue">Gallery images</h2>
              <p className="mt-2 text-sm text-gray">Add images, set captions, and arrange their order.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setItems((current) => [
                  ...current,
                  { key: crypto.randomUUID(), assetId: "", caption: "" },
                ])
              }
              className="cursor-pointer rounded-full border border-blue/15 px-4 py-2 text-sm font-bold text-blue hover:bg-blue-tint"
            >
              Add image
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item, index) => {
              const selectedAsset = assets.find((asset) => asset.id === item.assetId);
              return (
                <article
                  key={item.key}
                  className="grid gap-4 rounded-[0.8rem] border border-blue/10 bg-blue-tint/40 p-4 sm:grid-cols-[8rem_minmax(0,1fr)]"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-[0.65rem] bg-blue-tint">
                    {selectedAsset ? (
                      <img
                        src={selectedAsset.publicUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <select
                        value={item.assetId}
                        onChange={(event) => updateItem(item.key, { assetId: event.target.value })}
                        className="min-w-0 flex-1 rounded-[0.65rem] border border-blue/15 bg-white px-3 py-2.5 text-sm text-blue"
                      >
                        <option value="">Choose an image</option>
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.filename}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="cursor-pointer rounded-md px-2 py-2 text-blue disabled:cursor-not-allowed disabled:opacity-25"
                        aria-label="Move image up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        className="cursor-pointer rounded-md px-2 py-2 text-blue disabled:cursor-not-allowed disabled:opacity-25"
                        aria-label="Move image down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) => current.filter((candidate) => candidate.key !== item.key))
                        }
                        className="cursor-pointer rounded-md px-2 py-2 text-red-600"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      value={item.caption}
                      onChange={(event) => updateItem(item.key, { caption: event.target.value })}
                      className={fieldClass}
                      placeholder="Optional image caption"
                    />
                  </div>
                </article>
              );
            })}
            {!items.length ? (
              <p className="rounded-[0.8rem] bg-blue-tint px-5 py-10 text-center text-sm text-gray">
                No images yet. Add an image from the media library.
              </p>
            ) : null}
          </div>
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
            {saving ? "Saving…" : gallery ? "Save changes" : "Create gallery"}
          </button>
          {message ? <p className="mt-3 text-sm font-medium text-red-600">{message}</p> : null}
        </section>

        <section className="rounded-[1rem] border border-blue/10 bg-white p-5">
          <h2 className="font-bold text-blue">Cover image</h2>
          {coverAsset ? (
            <img
              src={coverAsset.publicUrl}
              alt=""
              className="mt-4 aspect-[4/3] w-full rounded-[0.65rem] object-cover"
            />
          ) : null}
          <select
            value={coverAssetId}
            onChange={(event) => setCoverAssetId(event.target.value)}
            className={fieldClass}
            aria-label="Cover image"
          >
            <option value="">No cover image</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.filename}
              </option>
            ))}
          </select>
        </section>

        {gallery && canPublish ? (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="w-full cursor-pointer rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete gallery
          </button>
        ) : null}
      </aside>
    </div>
  );
}
