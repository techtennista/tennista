"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function CourtManager({ courts, canImport }: { courts: AdminCourt[]; canImport: boolean }) {
  const router = useRouter();
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function importCourts() {
    setImporting(true);
    setMessage("");
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
      setMessage(`Found ${result.found}; added ${result.imported} for review and skipped ${result.duplicates} existing records.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
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
          {message ? <p className="mt-3 text-sm leading-5 text-blue/65">{message}</p> : null}
        </section>
      ) : null}

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
