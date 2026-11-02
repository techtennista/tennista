"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importGoogleMedia } from "@/components/admin/google-import";

export type AdminCourt = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  source: string;
  moderationStatus: string;
};

const fieldClass =
  "w-full rounded-xl border border-[#cdd8e9] bg-white px-4 py-3 text-sm text-blue outline-none focus:border-blue focus:ring-2 focus:ring-blue/10";

function CourtRow({ court }: { court: AdminCourt }) {
  const router = useRouter();
  const [status, setStatus] = useState(court.moderationStatus);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const response = await fetch(`/api/admin/courts/${court.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (response.ok) router.refresh();
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_8rem_12rem] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-blue">{court.name}</h2>
          <span className="rounded-full bg-blue-tint px-2 py-1 text-[0.65rem] font-bold uppercase text-blue/55">{court.source}</span>
        </div>
        <p className="mt-1 truncate text-xs text-blue/50">{court.address}, {court.city}, {court.state}, {court.country}</p>
      </div>
      <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">{court.moderationStatus}</span>
      <div className="flex gap-2">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-0 flex-1 cursor-pointer rounded-full border border-blue/15 px-3 py-2 text-xs text-blue">
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <button type="button" onClick={save} disabled={saving || status === court.moderationStatus} className="cursor-pointer rounded-full bg-blue px-3 py-2 text-xs font-bold text-white hover:bg-[#123e96] disabled:cursor-default disabled:opacity-40">
          Save
        </button>
      </div>
    </div>
  );
}

export function CourtManager({
  courts,
  canImport,
  canPublish,
}: {
  courts: AdminCourt[];
  canImport: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createTone, setCreateTone] = useState<"error" | "success" | "info">("info");
  const [newCourt, setNewCourt] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    description: "",
    imageUrl: "",
    googleUrl: "",
    file: null as File | null,
    publish: canPublish,
  });

  async function importCourts() {
    setImporting(true);
    setMessage("");
    setMessageTone("info");
    try {
      const response = await fetch("/api/admin/courts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state, city }),
      });
      const result = (await response.json()) as {
        error?: string;
        found?: number;
        imported?: number;
        duplicates?: number;
      };
      if (!response.ok) throw new Error(result.error ?? "Import failed.");
      setMessageTone("success");
      setMessage(`Found ${result.found}; added ${result.imported} for review and skipped ${result.duplicates} existing records.`);
      router.refresh();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function uploadCourtImage() {
    if (newCourt.file) {
      const presignResponse = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: newCourt.file.name,
          contentType: newCourt.file.type,
          byteSize: newCourt.file.size,
        }),
      });
      const presign = (await presignResponse.json()) as {
        uploadUrl?: string;
        objectKey?: string;
        publicUrl?: string;
        message?: string;
      };
      if (!presignResponse.ok || !presign.uploadUrl || !presign.objectKey) {
        throw new Error(presign.message ?? "Unable to prepare the court photo.");
      }
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": newCourt.file.type },
        body: newCourt.file,
      });
      if (!uploadResponse.ok) throw new Error("The court photo upload failed.");
      const dimensions = newCourt.file.type.startsWith("image/")
        ? { width: null as number | null, height: null as number | null }
        : { width: null, height: null };
      const saveResponse = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectKey: presign.objectKey,
          originalName: newCourt.file.name,
          mimeType: newCourt.file.type,
          byteSize: newCourt.file.size,
          ...dimensions,
          altText: `${newCourt.name || "Tennis court"} photo`,
        }),
      });
      const saved = (await saveResponse.json()) as { asset?: { id: string; url: string }; message?: string };
      if (!saveResponse.ok) throw new Error(saved.message ?? "Unable to save the court photo.");
      return { imageUrl: saved.asset?.url ?? presign.publicUrl ?? "", imageAssetId: saved.asset?.id };
    }

    if (newCourt.googleUrl.trim()) {
      setCreateTone("info");
      setCreateMessage("Importing the court photo from Google…");
      const imported = await importGoogleMedia({
        url: newCourt.googleUrl.trim(),
        title: newCourt.name || "Tennis court",
      });
      const image = imported.assets.find((asset) => asset.mimeType.startsWith("image/"));
      if (!image) throw new Error("That Google link did not contain a photo.");
      return { imageUrl: image.url, imageAssetId: image.id };
    }

    return { imageUrl: newCourt.imageUrl.trim() || null, imageAssetId: null };
  }

  async function createCourt() {
    if (!newCourt.name.trim() || !newCourt.address.trim() || !newCourt.city.trim() || !newCourt.state.trim()) {
      setCreateTone("error");
      setCreateMessage("Name, address, city, and state are required.");
      return;
    }
    setCreating(true);
    setCreateTone("info");
    setCreateMessage("");
    try {
      const image = await uploadCourtImage();
      const response = await fetch("/api/admin/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCourt.name,
          address: newCourt.address,
          city: newCourt.city,
          state: newCourt.state,
          country: newCourt.country,
          description: newCourt.description,
          imageUrl: image.imageUrl,
          imageAssetId: image.imageAssetId,
          status: newCourt.publish && canPublish ? "published" : "pending",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to create that location.");
      setNewCourt({
        name: "",
        address: "",
        city: "",
        state: "",
        country: newCourt.country || "Nigeria",
        description: "",
        imageUrl: "",
        googleUrl: "",
        file: null,
        publish: canPublish,
      });
      setCreateTone("success");
      setCreateMessage("Location saved.");
      router.refresh();
    } catch (error) {
      setCreateTone("error");
      setCreateMessage(error instanceof Error ? error.message : "Unable to create that location.");
    } finally {
      setCreating(false);
    }
  }

  function statusBanner(tone: "error" | "success" | "info", text: string) {
    const styles =
      tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-blue/15 bg-blue-tint text-blue";
    return (
      <p
        role={tone === "error" ? "alert" : "status"}
        aria-live={tone === "error" ? "assertive" : "polite"}
        className={`mt-3 rounded-[0.75rem] border px-3 py-3 text-sm font-medium leading-relaxed ${styles}`}
      >
        {text}
      </p>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="space-y-6">
      <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
        <h2 className="font-bold text-blue">Add a location</h2>
        <p className="mt-2 text-sm leading-6 text-blue/55">
          Create a court by hand and attach a photo from your computer or a public Google link.
        </p>
        <label className="mt-5 block text-sm font-semibold text-blue">
          Name
          <input
            value={newCourt.name}
            onChange={(event) => setNewCourt((current) => ({ ...current, name: event.target.value }))}
            className={`mt-2 ${fieldClass}`}
            placeholder="Lagos Lawn Tennis Club"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-blue">
          Address
          <input
            value={newCourt.address}
            onChange={(event) => setNewCourt((current) => ({ ...current, address: event.target.value }))}
            className={`mt-2 ${fieldClass}`}
            placeholder="Street, area"
          />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-blue">
            City
            <input
              value={newCourt.city}
              onChange={(event) => setNewCourt((current) => ({ ...current, city: event.target.value }))}
              className={`mt-2 ${fieldClass}`}
            />
          </label>
          <label className="block text-sm font-semibold text-blue">
            State
            <input
              value={newCourt.state}
              onChange={(event) => setNewCourt((current) => ({ ...current, state: event.target.value }))}
              className={`mt-2 ${fieldClass}`}
            />
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-blue">
          Country
          <input
            value={newCourt.country}
            onChange={(event) => setNewCourt((current) => ({ ...current, country: event.target.value }))}
            className={`mt-2 ${fieldClass}`}
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-blue">
          Description (optional)
          <textarea
            value={newCourt.description}
            onChange={(event) => setNewCourt((current) => ({ ...current, description: event.target.value }))}
            className={`mt-2 ${fieldClass} min-h-24 resize-y`}
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-blue">
          Photo file
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setNewCourt((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
            className="mt-2 block w-full cursor-pointer text-sm text-blue/70"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-blue">
          Or paste a Google Drive / Photos URL
          <input
            type="url"
            value={newCourt.googleUrl}
            onChange={(event) => setNewCourt((current) => ({ ...current, googleUrl: event.target.value }))}
            className={`mt-2 ${fieldClass}`}
            placeholder="https://drive.google.com/…"
          />
        </label>
        {canPublish ? (
          <label className="mt-4 flex items-center gap-3 text-sm text-blue/70">
            <input
              type="checkbox"
              checked={newCourt.publish}
              onChange={(event) => setNewCourt((current) => ({ ...current, publish: event.target.checked }))}
            />
            Publish immediately
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => void createCourt()}
          disabled={creating}
          className="mt-5 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-[#123e96] disabled:cursor-wait disabled:opacity-50"
        >
          {creating ? "Saving location…" : "Create location"}
        </button>
        {createMessage ? statusBanner(createTone, createMessage) : null}
      </section>
      {canImport ? (
        <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
          <h2 className="font-bold text-blue">Import from OpenStreetMap</h2>
          <p className="mt-2 text-sm leading-6 text-blue/55">Search a country, state, and optional city. Imported courts stay hidden until approved.</p>
          <label className="mt-5 block text-sm font-semibold text-blue">
            Country
            <input value={country} onChange={(event) => setCountry(event.target.value)} className={`mt-2 ${fieldClass}`} />
          </label>
          <label className="mt-4 block text-sm font-semibold text-blue">
            State
            <input value={state} onChange={(event) => setState(event.target.value)} className={`mt-2 ${fieldClass}`} placeholder="Lagos" />
          </label>
          <label className="mt-4 block text-sm font-semibold text-blue">
            City (optional)
            <input value={city} onChange={(event) => setCity(event.target.value)} className={`mt-2 ${fieldClass}`} placeholder="Ikeja" />
          </label>
          <button type="button" onClick={importCourts} disabled={importing || !country.trim() || !state.trim()} className="mt-5 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-[#123e96] disabled:cursor-wait disabled:opacity-50">
            {importing ? "Searching OpenStreetMap…" : "Find courts to review"}
          </button>
          {message ? statusBanner(messageTone, message) : null}
        </section>
      ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#dce4f0] bg-white shadow-sm">
        {courts.length ? (
          <div className="divide-y divide-[#e7edf6]">
            {courts.map((court) => <CourtRow key={court.id} court={court} />)}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-bold text-blue">No matching courts</h2>
            <p className="mt-2 text-sm text-blue/55">Adjust the filter or import a new location.</p>
          </div>
        )}
      </section>
    </div>
  );
}
