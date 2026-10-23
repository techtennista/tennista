"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleBlock, ArticleDocument } from "@/lib/cms-content";

type AssetOption = {
  id: string;
  filename: string;
  publicUrl: string;
};

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ArticleDocument;
  coverAssetId: string;
  status: string;
  publishedAt: string;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#cdd8e9] bg-white px-4 py-3 text-sm text-blue outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10";

function makeBlock(type: ArticleBlock["type"]): ArticleBlock {
  const id = crypto.randomUUID();
  if (type === "image") return { id, type, assetId: "", caption: "" };
  if (type === "quote") return { id, type, text: "", attribution: "" };
  return { id, type, text: "" };
}

export function NewsEditor({
  assets,
  post,
  canPublish,
}: {
  assets: AssetOption[];
  post?: EditablePost;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverAssetId, setCoverAssetId] = useState(post?.coverAssetId ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ? post.publishedAt.slice(0, 16) : "",
  );
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    post?.content.blocks?.length
      ? post.content.blocks
      : [makeBlock("paragraph")],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateBlock(index: number, updates: Partial<ArticleBlock>) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? ({ ...block, ...updates } as ArticleBlock) : block,
      ),
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    if (!title.trim()) {
      setMessage("Add a title before saving.");
      return;
    }
    setSaving(true);
    setMessage("");

    const response = await fetch(post ? `/api/admin/news/${post.id}` : "/api/admin/news", {
      method: post ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        coverAssetId: coverAssetId || null,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
        content: { version: 1, blocks },
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "The article could not be saved.");
      return;
    }

    router.push("/admin/news");
    router.refresh();
  }

  async function remove() {
    if (!post || !window.confirm("Delete this article and its revision history?")) return;
    setSaving(true);
    const response = await fetch(`/api/admin/news/${post.id}`, { method: "DELETE" });
    if (!response.ok) {
      setSaving(false);
      setMessage("The article could not be deleted.");
      return;
    }
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-7">
          <label className="block text-sm font-semibold text-blue">
            Article title
            <input
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!post && !slug) {
                  setSlug(
                    nextTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              className={`${fieldClass} text-lg font-semibold`}
              placeholder="What happened?"
            />
          </label>
          <label className="mt-5 block text-sm font-semibold text-blue">
            URL slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={fieldClass}
              placeholder="article-url-slug"
            />
          </label>
          <label className="mt-5 block text-sm font-semibold text-blue">
            Summary
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className={`${fieldClass} min-h-28 resize-y`}
              placeholder="A short summary shown on news cards and search results."
            />
          </label>
        </section>

        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-blue">Story content</h2>
              <p className="mt-1 text-sm text-blue/55">
                Build the article with text, headings, quotes, and media-library images.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["paragraph", "heading", "quote", "image"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBlocks((current) => [...current, makeBlock(type)])}
                  className="cursor-pointer rounded-full border border-blue/15 px-3 py-2 text-xs font-bold capitalize text-blue hover:bg-blue-tint"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="rounded-xl border border-[#dce4f0] bg-[#f8fbff] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-blue/45">
                    {block.type}
                  </span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveBlock(index, -1)} className="cursor-pointer rounded-md px-2 py-1 text-blue/60 hover:bg-white" aria-label="Move block up">↑</button>
                    <button type="button" onClick={() => moveBlock(index, 1)} className="cursor-pointer rounded-md px-2 py-1 text-blue/60 hover:bg-white" aria-label="Move block down">↓</button>
                    <button
                      type="button"
                      onClick={() => setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="cursor-pointer rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                      aria-label="Remove block"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {block.type === "image" ? (
                  <div className="space-y-3">
                    <select
                      value={block.assetId}
                      onChange={(event) => updateBlock(index, { assetId: event.target.value })}
                      className={fieldClass}
                    >
                      <option value="">Choose an image</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>{asset.filename}</option>
                      ))}
                    </select>
                    <input
                      value={block.caption ?? ""}
                      onChange={(event) => updateBlock(index, { caption: event.target.value })}
                      className={fieldClass}
                      placeholder="Optional caption"
                    />
                  </div>
                ) : (
                  <>
                    <textarea
                      value={block.text}
                      onChange={(event) => updateBlock(index, { text: event.target.value })}
                      className={`${fieldClass} min-h-28 resize-y`}
                      placeholder={
                        block.type === "heading"
                          ? "Section heading"
                          : block.type === "quote"
                            ? "Quoted statement"
                            : "Write the next part of the story…"
                      }
                    />
                    {block.type === "quote" ? (
                      <input
                        value={block.attribution ?? ""}
                        onChange={(event) => updateBlock(index, { attribution: event.target.value })}
                        className={fieldClass}
                        placeholder="Optional attribution"
                      />
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
          <h2 className="font-bold text-blue">Publishing</h2>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}>
              <option value="draft">Draft</option>
              <option value="review">Ready for review</option>
              {canPublish ? <option value="scheduled">Scheduled</option> : null}
              {canPublish ? <option value="published">Published</option> : null}
              {canPublish ? <option value="archived">Archived</option> : null}
            </select>
          </label>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Publish date
            <input type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} className={fieldClass} />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-5 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123e96] disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : post ? "Save changes" : "Create article"}
          </button>
          {message ? <p className="mt-3 text-sm font-medium text-red-600">{message}</p> : null}
        </section>

        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
          <h2 className="font-bold text-blue">Presentation</h2>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Cover image
            <select value={coverAssetId} onChange={(event) => setCoverAssetId(event.target.value)} className={fieldClass}>
              <option value="">No cover image</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.filename}</option>
              ))}
            </select>
          </label>
        </section>

        {post && canPublish ? (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="w-full cursor-pointer rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          >
            Delete article
          </button>
        ) : null}
      </aside>
    </div>
  );
}
