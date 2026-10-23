import Link from "next/link";
import { NewsEditor } from "@/components/admin/news-editor";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
  object_key: string;
};

export default async function NewArticlePage() {
  const session = await requireAdmin();
  const result = await db.query<AssetRow>(
    `
      SELECT id, original_name, object_key
      FROM cms_assets
      WHERE mime_type LIKE 'image/%' AND status = 'ready'
      ORDER BY created_at DESC
    `,
  );

  return (
    <div>
      <Link href="/admin/news" className="text-sm font-bold text-blue/55 hover:text-blue">← News articles</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-blue">New article</h1>
      <div className="mt-7">
        <NewsEditor
          assets={result.rows.map((asset) => ({
            id: asset.id,
            filename: asset.original_name,
            publicUrl: publicAssetUrl(asset.object_key),
          }))}
          canPublish={session.role !== "contributor"}
        />
      </div>
    </div>
  );
}
