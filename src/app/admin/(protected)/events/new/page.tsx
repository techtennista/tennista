import Link from "next/link";
import { EventEditor } from "@/components/admin/event-editor";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
};

export default async function NewEventPage() {
  const session = await requireAdmin();
  const result = await db.query<AssetRow>(
    `
      SELECT id, original_name
      FROM cms_assets
      WHERE status = 'ready' AND mime_type LIKE 'image/%'
      ORDER BY created_at DESC
      LIMIT 100
    `,
  );

  return (
    <div>
      <Link href="/admin/events" className="text-sm font-bold text-blue/55 hover:text-blue">
        ← Events
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-blue">New event</h1>
      <div className="mt-7">
        <EventEditor
          assets={result.rows.map((asset) => ({
            id: asset.id,
            name: asset.original_name,
          }))}
          canPublish={session.role !== "contributor"}
        />
      </div>
    </div>
  );
}
