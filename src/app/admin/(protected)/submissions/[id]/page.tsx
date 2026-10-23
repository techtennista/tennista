import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmissionWorkflow } from "@/components/admin/submission-workflow";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { formTypeLabel, sourcePathLabel } from "@/lib/form-labels";

export const dynamic = "force-dynamic";

type SubmissionRow = {
  id: string;
  form_type: string;
  payload: Record<string, unknown>;
  status: string;
  submitted_at: Date;
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const result = await db.query<SubmissionRow>(
    `
      SELECT id, form_type, payload, status, submitted_at
      FROM cms_submissions
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const submission = result.rows[0];
  if (!submission) notFound();
  const name = String(submission.payload.name ?? "");
  const email = String(submission.payload.email ?? "");
  const phone = String(submission.payload.phone ?? "");
  const subject = String(submission.payload.subject ?? "");
  const message = String(submission.payload.message ?? "");
  const sourcePath = String(submission.payload.sourcePath ?? "");
  const notes = String(submission.payload._adminNotes ?? "");
  const hiddenFields = new Set(["name", "email", "phone", "subject", "message", "sourcePath", "userAgent", "_adminNotes"]);
  const extraFields = Object.entries(submission.payload ?? {}).filter(([key]) => !hiddenFields.has(key));

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <Link href="/admin/submissions" className="text-sm font-bold text-blue/55 hover:text-blue">← All forms</Link>
        <Link href={`/admin/forms/${submission.form_type}`} className="text-sm font-bold text-blue/55 hover:text-blue">
          ← {formTypeLabel(submission.form_type)}
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">
            {formTypeLabel(submission.form_type)}
            {sourcePathLabel(sourcePath) ? ` · ${sourcePathLabel(sourcePath)}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">
            {name || subject || "Website submission"}
          </h1>
        </div>
        <time className="text-sm text-blue/50">
          {new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short" }).format(submission.submitted_at)}
        </time>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#dce4f0] bg-white p-6 shadow-sm">
            <h2 className="font-bold text-blue">Contact details</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                ["Name", name],
                ["Email", email],
                ["Phone", phone],
                ["Source page", sourcePathLabel(sourcePath) || sourcePath],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-blue/40">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-blue">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          {message ? (
            <section className="rounded-2xl border border-[#dce4f0] bg-white p-6 shadow-sm">
              <h2 className="font-bold text-blue">Message</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-blue/75">{message}</p>
            </section>
          ) : null}

          {extraFields.length ? (
            <section className="rounded-2xl border border-[#dce4f0] bg-white p-6 shadow-sm">
              <h2 className="font-bold text-blue">Submitted details</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                {extraFields.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-blue/40">{label.replaceAll("_", " ")}</dt>
                    <dd className="mt-1 break-words text-sm text-blue">
                      {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <SubmissionWorkflow id={submission.id} initialStatus={submission.status} initialNotes={notes} />
      </div>
    </div>
  );
}
