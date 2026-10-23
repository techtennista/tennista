import Link from "next/link";
import { formTypeLabel, sourcePathLabel } from "@/lib/form-labels";

export type SubmissionListItem = {
  id: string;
  form_type: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  source_path: string | null;
  status: string;
  submitted_at: Date;
};

export const SUBMISSIONS_PAGE_SIZE = 20;

export function SubmissionList({
  items,
  showFormType = true,
  emptyTitle = "No matching submissions",
  emptyBody = "New website submissions will appear here automatically.",
}: {
  items: SubmissionListItem[];
  showFormType?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (!items.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#dce4f0] bg-white shadow-sm">
        <div className="px-6 py-16 text-center">
          <h2 className="font-bold text-blue">{emptyTitle}</h2>
          <p className="mt-2 text-sm text-blue/55">{emptyBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce4f0] bg-white shadow-sm">
      <div className="divide-y divide-[#e7edf6]">
        {items.map((submission) => {
          const formLabel = formTypeLabel(submission.form_type);
          const pageLabel = sourcePathLabel(submission.source_path);
          return (
            <Link
              key={submission.id}
              href={`/admin/submissions/${submission.id}`}
              className={`grid cursor-pointer gap-3 p-4 transition hover:bg-[#f7faff] sm:items-center ${
                showFormType
                  ? "sm:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)_8rem_9rem]"
                  : "sm:grid-cols-[minmax(0,1fr)_8rem_9rem]"
              }`}
            >
              {showFormType ? (
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-blue">{formLabel}</span>
                  {pageLabel ? <span className="mt-1 block truncate text-[0.7rem] text-blue/45">{pageLabel}</span> : null}
                </div>
              ) : null}
              <div className="min-w-0">
                <h2 className="truncate font-bold text-blue">
                  {submission.name || submission.email || submission.subject || "Anonymous submission"}
                </h2>
                <p className="mt-1 truncate text-xs text-blue/45">
                  {[!showFormType && pageLabel, submission.email, submission.subject].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">
                {submission.status.replace("_", " ")}
              </span>
              <time className="text-xs text-blue/50">
                {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(submission.submitted_at)}
              </time>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SubmissionPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-blue/55">
        Showing <span className="font-bold text-blue">{start}–{end}</span> of{" "}
        <span className="font-bold text-blue">{totalItems}</span>
      </p>
      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
          <Link
            href={hrefForPage(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${
              page <= 1
                ? "pointer-events-none border-blue/10 text-blue/30"
                : "border-blue/15 text-blue hover:border-blue hover:bg-blue-tint"
            }`}
          >
            Previous
          </Link>
          {windowStart > 1 ? (
            <>
              <Link href={hrefForPage(1)} className="rounded-full border border-blue/15 px-3 py-2 text-sm font-bold text-blue hover:bg-blue-tint">
                1
              </Link>
              {windowStart > 2 ? <span className="px-1 text-blue/35">…</span> : null}
            </>
          ) : null}
          {pages.map((entry) => (
            <Link
              key={entry}
              href={hrefForPage(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-bold ${
                entry === page ? "bg-blue text-white" : "border border-blue/15 text-blue hover:bg-blue-tint"
              }`}
            >
              {entry}
            </Link>
          ))}
          {windowEnd < totalPages ? (
            <>
              {windowEnd < totalPages - 1 ? <span className="px-1 text-blue/35">…</span> : null}
              <Link
                href={hrefForPage(totalPages)}
                className="rounded-full border border-blue/15 px-3 py-2 text-sm font-bold text-blue hover:bg-blue-tint"
              >
                {totalPages}
              </Link>
            </>
          ) : null}
          <Link
            href={hrefForPage(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${
              page >= totalPages
                ? "pointer-events-none border-blue/10 text-blue/30"
                : "border-blue/15 text-blue hover:border-blue hover:bg-blue-tint"
            }`}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
