"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AssetOption = {
  id: string;
  name: string;
};

export type EventBlock = {
  id: string;
  type: "paragraph" | "heading";
  text: string;
};

export type EditableEvent = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  blocks: EventBlock[];
  featured: boolean;
  venueName: string;
  address: string;
  city: string;
  country: string;
  startsAt: string;
  endsAt: string;
  registrationUrl: string;
  coverAssetId: string;
  status: string;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#cdd8e9] bg-white px-4 py-3 text-sm text-blue outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10";

function toDateTimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function newBlock(type: EventBlock["type"]): EventBlock {
  return { id: crypto.randomUUID(), type, text: "" };
}

export function EventEditor({
  assets,
  event,
  canPublish,
}: {
  assets: AssetOption[];
  event?: EditableEvent;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [summary, setSummary] = useState(event?.summary ?? "");
  const [blocks, setBlocks] = useState<EventBlock[]>(
    event?.blocks.length ? event.blocks : [newBlock("paragraph")],
  );
  const [featured, setFeatured] = useState(event?.featured ?? false);
  const [venueName, setVenueName] = useState(event?.venueName ?? "");
  const [address, setAddress] = useState(event?.address ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const [country, setCountry] = useState(event?.country ?? "Nigeria");
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(event?.startsAt ?? ""));
  const [endsAt, setEndsAt] = useState(toDateTimeLocal(event?.endsAt ?? ""));
  const [registrationUrl, setRegistrationUrl] = useState(event?.registrationUrl ?? "");
  const [coverAssetId, setCoverAssetId] = useState(event?.coverAssetId ?? "");
  const [status, setStatus] = useState(event?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateBlock(index: number, text: string) {
    setBlocks((current) =>
      current.map((block, blockIndex) => (blockIndex === index ? { ...block, text } : block)),
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    if (!title.trim() || !startsAt) {
      setMessage("Add a title and start date before saving.");
      return;
    }
    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      setMessage("The end date must be after the start date.");
      return;
    }

    setSaving(true);
    setMessage("");
    const response = await fetch(
      event ? `/api/admin/events/${event.id}` : "/api/admin/events",
      {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content: { version: 1, blocks },
          featured,
          venueName,
          address,
          city,
          country,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          registrationUrl,
          coverAssetId: coverAssetId || null,
          status,
        }),
      },
    );
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "The event could not be saved.");
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  async function remove() {
    if (!event || !window.confirm("Delete this event permanently?")) return;
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setSaving(false);
      setMessage(result.error ?? "The event could not be deleted.");
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-7">
          <label className="block text-sm font-semibold text-blue">
            Event title
            <input
              value={title}
              onChange={(changeEvent) => {
                const nextTitle = changeEvent.target.value;
                setTitle(nextTitle);
                if (!event && !slug) {
                  setSlug(
                    nextTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
              className={`${fieldClass} text-lg font-semibold`}
              placeholder="Event name"
              maxLength={200}
            />
          </label>
          <label className="mt-5 block text-sm font-semibold text-blue">
            URL slug
            <input
              value={slug}
              onChange={(changeEvent) => setSlug(changeEvent.target.value)}
              className={fieldClass}
              placeholder="event-url-slug"
              maxLength={200}
            />
          </label>
          <label className="mt-5 block text-sm font-semibold text-blue">
            Summary
            <textarea
              value={summary}
              onChange={(changeEvent) => setSummary(changeEvent.target.value)}
              className={`${fieldClass} min-h-28 resize-y`}
              placeholder="A short description shown on event cards."
              maxLength={1000}
            />
          </label>
        </section>

        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-blue">Event description</h2>
              <p className="mt-1 text-sm text-blue/55">
                Add simple headings and text blocks for the event page.
              </p>
            </div>
            <div className="flex gap-2">
              {(["paragraph", "heading"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBlocks((current) => [...current, newBlock(type)])}
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
                <textarea
                  value={block.text}
                  onChange={(changeEvent) => updateBlock(index, changeEvent.target.value)}
                  className={`${fieldClass} min-h-28 resize-y`}
                  placeholder={block.type === "heading" ? "Section heading" : "Event details…"}
                  maxLength={20000}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-blue">Date and location</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-blue">
              Starts
              <input type="datetime-local" required value={startsAt} onChange={(changeEvent) => setStartsAt(changeEvent.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-blue">
              Ends
              <input type="datetime-local" value={endsAt} onChange={(changeEvent) => setEndsAt(changeEvent.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-blue sm:col-span-2">
              Venue
              <input value={venueName} onChange={(changeEvent) => setVenueName(changeEvent.target.value)} className={fieldClass} maxLength={200} />
            </label>
            <label className="block text-sm font-semibold text-blue sm:col-span-2">
              Address
              <input value={address} onChange={(changeEvent) => setAddress(changeEvent.target.value)} className={fieldClass} maxLength={500} />
            </label>
            <label className="block text-sm font-semibold text-blue">
              City
              <input value={city} onChange={(changeEvent) => setCity(changeEvent.target.value)} className={fieldClass} maxLength={120} />
            </label>
            <label className="block text-sm font-semibold text-blue">
              Country
              <input value={country} onChange={(changeEvent) => setCountry(changeEvent.target.value)} className={fieldClass} maxLength={120} />
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
          <h2 className="font-bold text-blue">Publishing</h2>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Status
            <select value={status} onChange={(changeEvent) => setStatus(changeEvent.target.value)} className={fieldClass}>
              <option value="draft">Draft</option>
              {canPublish ? <option value="review">In review</option> : null}
              {canPublish ? <option value="scheduled">Scheduled</option> : null}
              {canPublish ? <option value="published">Published</option> : null}
              {canPublish ? <option value="cancelled">Cancelled</option> : null}
              {canPublish ? <option value="archived">Archived</option> : null}
            </select>
          </label>
          <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-blue">
            <input type="checkbox" checked={featured} onChange={(changeEvent) => setFeatured(changeEvent.target.checked)} className="size-4 accent-blue" />
            Feature this event
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-5 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123e96] disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
          {message ? <p aria-live="polite" className="mt-3 text-sm font-medium text-red-600">{message}</p> : null}
        </section>

        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
          <h2 className="font-bold text-blue">Presentation</h2>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Cover image
            <select value={coverAssetId} onChange={(changeEvent) => setCoverAssetId(changeEvent.target.value)} className={fieldClass}>
              <option value="">No cover image</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-semibold text-blue">
            Registration URL
            <input type="url" value={registrationUrl} onChange={(changeEvent) => setRegistrationUrl(changeEvent.target.value)} className={fieldClass} placeholder="https://" maxLength={2000} />
          </label>
        </section>

        {event && canPublish ? (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="w-full cursor-pointer rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          >
            Delete event
          </button>
        ) : null}
      </aside>
    </div>
  );
}
