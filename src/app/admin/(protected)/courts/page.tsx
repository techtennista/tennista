import { CourtManager, type AdminCourt } from "@/components/admin/court-manager";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type CourtRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  source: string;
  moderation_status: string;
};

export default async function CourtsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireAdmin();
  const filters = await searchParams;
  const status = filters.status?.trim() ?? "";
  const query = filters.q?.trim() ?? "";
  const result = await db.query<CourtRow>(
    `
      SELECT id::text, name, address, city, state, country, source, moderation_status
      FROM tennis_courts
      WHERE ($1 = '' OR moderation_status = $1)
        AND (
          $2 = ''
          OR name ILIKE '%' || $2 || '%'
          OR city ILIKE '%' || $2 || '%'
          OR state ILIKE '%' || $2 || '%'
          OR country ILIKE '%' || $2 || '%'
        )
      ORDER BY
        CASE WHEN moderation_status = 'pending' THEN 0 ELSE 1 END,
        updated_at DESC
      LIMIT 300
    `,
    [status, query],
  );
  const courts: AdminCourt[] = result.rows.map((court) => ({
    id: court.id,
    name: court.name,
    address: court.address,
    city: court.city,
    state: court.state,
    country: court.country,
    source: court.source,
    moderationStatus: court.moderation_status,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Directory</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">Tennis courts</h1>
          <p className="mt-2 text-sm text-blue/60">Import, verify, and publish locations for the public court finder.</p>
        </div>
        <a
          href={`/api/admin/courts/export?${new URLSearchParams({
            ...(status ? { status } : {}),
            ...(query ? { q: query } : {}),
          }).toString()}`}
          className="rounded-full border border-blue/15 bg-white px-5 py-2 text-sm font-bold text-blue transition hover:border-blue hover:bg-blue-tint"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-7 flex flex-wrap gap-3 rounded-2xl border border-[#dce4f0] bg-white p-4 shadow-sm">
        <input name="q" defaultValue={query} placeholder="Search name or location" className="min-w-[15rem] flex-1 rounded-full border border-blue/15 px-4 py-2 text-sm text-blue outline-none focus:border-blue" />
        <select name="status" defaultValue={status} className="cursor-pointer rounded-full border border-blue/15 bg-white px-4 py-2 text-sm text-blue">
          <option value="">All statuses</option>
          <option value="pending">Pending review</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <button className="cursor-pointer rounded-full bg-blue px-5 py-2 text-sm font-bold text-white hover:bg-[#123e96]">Filter</button>
      </form>

      <CourtManager courts={courts} canImport={session.role !== "contributor"} />
    </div>
  );
}
