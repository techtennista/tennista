import Link from "next/link";
import {
  SUBMISSIONS_PAGE_SIZE,
  SubmissionList,
  SubmissionPagination,
  type SubmissionListItem,
} from "@/components/admin/submission-list";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { FORM_TYPE_FILTERS, formTypeHref } from "@/lib/form-labels";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const status = filters.status?.trim() ?? "";
  const requestedPage = Math.max(1, Number(filters.page ?? "1") || 1);

  const [statusCounts, typeCounts, filteredCount] = await Promise.all([
    db.query<{ status: string; total: string }>(
      `
        SELECT status, COUNT(*)::TEXT AS total
        FROM cms_submissions
        GROUP BY status
      `,
    ),
    db.query<{ form_type: string; total: string; new_total: string }>(
      `
        SELECT form_type,
          COUNT(*)::TEXT AS total,
          COUNT(*) FILTER (WHERE status = 'new')::TEXT AS new_total
        FROM cms_submissions
        GROUP BY form_type
      `,
    ),
    db.query<{ total: string }>(
      `
        SELECT COUNT(*)::TEXT AS total
        FROM cms_submissions
        WHERE ($1 = '' OR status = $1)
      `,
      [status],
    ),
  ]);

  const byStatus = Object.fromEntries(statusCounts.rows.map((row) => [row.status, Number(row.total)]));
  const byType = Object.fromEntries(
    typeCounts.rows.map((row) => [
      row.form_type,
      { total: Number(row.total), newTotal: Number(row.new_total) },
    ]),
  );
  const totalCount = statusCounts.rows.reduce((sum, row) => sum + Number(row.total), 0);
  const totalItems = Number(filteredCount.rows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / SUBMISSIONS_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * SUBMISSIONS_PAGE_SIZE;

  const result = await db.query<SubmissionListItem>(
    `
      SELECT id, form_type, payload->>'name' AS name, payload->>'email' AS email,
        payload->>'subject' AS subject, payload->>'sourcePath' AS source_path,
        status, submitted_at
      FROM cms_submissions
      WHERE ($1 = '' OR status = $1)
      ORDER BY submitted_at DESC
      LIMIT $2 OFFSET $3
    `,
    [status, SUBMISSIONS_PAGE_SIZE, offset],
  );

  const statusCards = [
    { label: "New", value: byStatus.new ?? 0, href: "/admin/submissions?status=new", accent: true },
    { label: "In progress", value: byStatus.in_progress ?? 0, href: "/admin/submissions?status=in_progress" },
    { label: "Resolved", value: byStatus.resolved ?? 0, href: "/admin/submissions?status=resolved" },
    { label: "Total", value: totalCount, href: "/admin/submissions" },
  ];

  const hrefForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/admin/submissions?${query}` : "/admin/submissions";
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">Submissions inbox</h1>
          <p className="mt-2 text-sm text-blue/60">Open a form type to review every entry for that form.</p>
        </div>
        <a
          href={`/api/admin/submissions/export?${new URLSearchParams({
            ...(status ? { status } : {}),
          }).toString()}`}
          className="rounded-full border border-blue/15 bg-white px-5 py-2 text-sm font-bold text-blue transition hover:border-blue hover:bg-blue-tint"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FORM_TYPE_FILTERS.map((item) => {
          const stats = byType[item.value] ?? { total: 0, newTotal: 0 };
          return (
            <Link
              key={item.value}
              href={formTypeHref(item.value)}
              className="rounded-[1rem] border border-[#dce4f0] bg-white p-4 transition hover:border-blue/40"
            >
              <div className="flex items-end justify-between gap-3">
                <span className="font-display text-[2rem] leading-none font-extrabold text-blue">{stats.total}</span>
                {stats.newTotal > 0 ? (
                  <span className="rounded-full bg-blue px-2.5 py-1 text-[0.7rem] font-bold text-white">
                    {stats.newTotal} new
                  </span>
                ) : (
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-blue/35">0 new</span>
                )}
              </div>
              <span className="mt-3 block text-sm font-semibold text-blue">{item.label}</span>
              <span className="mt-1 block text-xs font-bold text-blue/40">View all entries →</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-blue">
          {status ? `${status.replaceAll("_", " ")} submissions` : "Recent submissions"}
        </h2>
      </div>

      <div className="mt-4">
        <SubmissionList items={result.rows} />
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
