import Link from "next/link";
import { notFound } from "next/navigation";
import { EventEditor, type EditableEvent } from "@/components/admin/event-editor";
import { requireAdmin } from "@/lib/admin-session";
import { parseEventContent } from "@/lib/admin-events";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: unknown;
  cover_asset_id: string | null;
  starts_at: Date;
  ends_at: Date | null;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  registration_url: string | null;
  status: string;
  created_by: string;
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const [eventResult, assetResult] = await Promise.all([
    db.query<EventRow>(
      `
        SELECT id, title, slug, summary, body, cover_asset_id, starts_at, ends_at,
          venue_name, address, city, country, registration_url, status, created_by
        FROM cms_events
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    ),
    db.query<AssetRow>(
      `
        SELECT id, original_name
        FROM cms_assets
        WHERE status = 'ready' AND mime_type LIKE 'image/%'
        ORDER BY created_at DESC
        LIMIT 100
      `,
    ),
  ]);

  const row = eventResult.rows[0];
  if (
    !row ||
    (session.role === "contributor" &&
      (row.created_by !== session.user.id || row.status !== "draft"))
  ) {
    notFound();
  }

  const content = parseEventContent(row.body);
  const event: EditableEvent = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    blocks: content.blocks,
    featured: content.featured,
    venueName: row.venue_name ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at?.toISOString() ?? "",
    registrationUrl: row.registration_url ?? "",
    coverAssetId: row.cover_asset_id ?? "",
    status: row.status,
  };

  return (
    <div>
      <Link href="/admin/events" className="text-sm font-bold text-blue/55 hover:text-blue">
        ← Events
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-blue">Edit event</h1>
      <div className="mt-7">
        <EventEditor
          event={event}
          assets={assetResult.rows.map((asset) => ({
            id: asset.id,
            name: asset.original_name,
          }))}
          canPublish={session.role !== "contributor"}
        />
      </div>
    </div>
  );
}
