import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  starts_at: Date;
  ends_at: Date | null;
  venue_name: string | null;
  city: string | null;
  featured: boolean;
};

export default async function AdminEventsPage() {
  const session = await requireAdmin();
  const result = await db.query<EventRow>(
    `
      SELECT id, slug, title, status, starts_at, ends_at, venue_name, city,
        COALESCE((body->>'featured')::boolean, FALSE) AS featured
      FROM cms_events
      WHERE ($1::boolean = FALSE OR (created_by = $2 AND status = 'draft'))
      ORDER BY starts_at DESC, updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );

  const formatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Calendar</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">Events</h1>
          <p className="mt-2 text-sm text-blue/60">
            Create and manage upcoming Tennista events, programmes, and registrations.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123e96]"
        >
          New event
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce4f0] bg-white shadow-sm">
        {result.rows.length ? (
          <div className="divide-y divide-[#e7edf6]">
            {result.rows.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="grid cursor-pointer gap-3 p-5 transition hover:bg-[#f7faff] md:grid-cols-[minmax(0,1fr)_11rem_9rem] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-bold text-blue">{event.title}</h2>
                    {event.featured ? (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-blue">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-blue/45">
                    {[event.venue_name, event.city].filter(Boolean).join(" · ") || `/${event.slug}`}
                  </p>
                </div>
                <time className="text-xs font-semibold text-blue/60">
                  {formatter.format(event.starts_at)}
                </time>
                <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">
                  {event.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-bold text-blue">No events yet</h2>
            <p className="mt-2 text-sm text-blue/55">Create the first event to start the calendar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
