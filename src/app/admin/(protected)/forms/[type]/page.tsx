import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SUBMISSIONS_PAGE_SIZE,
  SubmissionList,
  SubmissionPagination,
  type SubmissionListItem,
} from "@/components/admin/submission-list";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { formTypeHref, formTypeLabel, isFormType } from "@/lib/form-labels";

export const dynamic = "force-dynamic";

export default async function FormEntriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const { type } = await params;
  if (!isFormType(type)) notFound();

  const filters = await searchParams;
  const status = filters.status?.trim() ?? "";
  const requestedPage = Math.max(1, Number(filters.page ?? "1") || 1);

  const countResult = await db.query<{ total: string; new_total: string }>(
    `
      SELECT COUNT(*)::TEXT AS total,
        COUNT(*) FILTER (WHERE status = 'new')::TEXT AS new_total
      FROM cms_submissions
      WHERE form_type = $1
        AND ($2 = '' OR status = $2)
    `,
    [type, status],
  );
  const totalItems = Number(countResult.rows[0]?.total ?? 0);
  const newTotal = Number(countResult.rows[0]?.new_total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / SUBMISSIONS_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * SUBMISSIONS_PAGE_SIZE;

  const [result, statusCounts] = await Promise.all([
    db.query<SubmissionListItem>(
      `
        SELECT id, form_type, payload->>'name' AS name, payload->>'email' AS email,
          payload->>'subject' AS subject, payload->>'sourcePath' AS source_path,
          status, submitted_at
        FROM cms_submissions
        WHERE form_type = $1
          AND ($2 = '' OR status = $2)
        ORDER BY submitted_at DESC
        LIMIT $3 OFFSET $4
      `,
      [type, status, SUBMISSIONS_PAGE_SIZE, offset],
    ),
    db.query<{ status: string; total: string }>(
      `
        SELECT status, COUNT(*)::TEXT AS total
        FROM cms_submissions
        WHERE form_type = $1
        GROUP BY status
      `,
      [type],
    ),
  ]);

  const byStatus = Object.fromEntries(statusCounts.rows.map((row) => [row.status, Number(row.total)]));
  const label = formTypeLabel(type);
  const hrefForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `${formTypeHref(type)}?${query}` : formTypeHref(type);
  };

  return (
    <div>
      <Link href="/admin/submissions" className="text-sm font-bold text-blue/55 hover:text-blue">
        ← All forms
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Form entries</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">{label}</h1>
          <p className="mt-2 text-sm text-blue/60">
            {newTotal} new · {byStatus.in_progress ?? 0} in progress · {totalItems} total
          </p>
        </div>
        <a
          href={`/api/admin/submissions/export?${new URLSearchParams({
            type,
            ...(status ? { status } : {}),
          }).toString()}`}
          className="rounded-full border border-blue/15 bg-white px-5 py-2 text-sm font-bold text-blue transition hover:border-blue hover:bg-blue-tint"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "New", value: byStatus.new ?? 0, href: `${formTypeHref(type)}?status=new`, accent: true },
          { label: "In progress", value: byStatus.in_progress ?? 0, href: `${formTypeHref(type)}?status=in_progress` },
          { label: "Resolved", value: byStatus.resolved ?? 0, href: `${formTypeHref(type)}?status=resolved` },
          { label: "All entries", value: Object.values(byStatus).reduce((sum, value) => sum + value, 0), href: formTypeHref(type) },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-[1rem] border p-5 transition ${
              card.accent
                ? "border-blue bg-blue text-white hover:bg-[#123e96]"
                : "border-[#dce4f0] bg-white hover:border-blue/40"
            }`}
          >
            <span className={`font-display text-[2.75rem] leading-none font-extrabold ${card.accent ? "text-white" : "text-blue"}`}>
              {card.value}
            </span>
            <span className={`mt-3 block text-sm font-semibold ${card.accent ? "text-white/80" : "text-blue/55"}`}>
              {card.label}
            </span>
          </Link>
        ))}
      </div>

      <form className="mt-7 flex flex-wrap gap-3 rounded-2xl border border-[#dce4f0] bg-white p-4 shadow-sm">
        <select name="status" defaultValue={status} className="cursor-pointer rounded-full border border-blue/15 bg-white px-4 py-2 text-sm text-blue">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="spam">Spam</option>
          <option value="archived">Archived</option>
        </select>
        <button className="cursor-pointer rounded-full bg-blue px-5 py-2 text-sm font-bold text-white hover:bg-[#123e96]">
          Filter
        </button>
      </form>

      <div className="mt-5">
        <SubmissionList
          items={result.rows}
          showFormType={false}
          emptyTitle={`No ${label.toLowerCase()} entries`}
          emptyBody="When someone submits this form on the website, it will show up here."
        />
        <SubmissionPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={SUBMISSIONS_PAGE_SIZE}
          hrefForPage={hrefForPage}
        />
      </div>
    </div>
  );
}
