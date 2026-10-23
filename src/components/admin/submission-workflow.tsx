"use client";

import { useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#cdd8e9] bg-white px-4 py-3 text-sm text-blue outline-none focus:border-blue focus:ring-2 focus:ring-blue/10";

export function SubmissionWorkflow({
  id,
  initialStatus,
  initialNotes,
}: {
  id: string;
  initialStatus: string;
  initialNotes: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    setMessage(response.ok ? "Saved." : "Could not save this update.");
  }

  return (
    <section className="rounded-2xl border border-[#dce4f0] bg-white p-5 shadow-sm">
      <h2 className="font-bold text-blue">Workflow</h2>
      <label className="mt-4 block text-sm font-semibold text-blue">
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="spam">Spam</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold text-blue">
        Internal notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${fieldClass} min-h-32 resize-y`}
          placeholder="Visible only to the admin team"
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 w-full cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123e96] disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save update"}
      </button>
      {message ? <p className="mt-3 text-sm font-medium text-blue/65">{message}</p> : null}
    </section>
  );
}
