import { notFound } from "next/navigation";
import Link from "next/link";
import { NewsEditor, type EditablePost } from "@/components/admin/news-editor";
import { requireAdmin } from "@/lib/admin-session";
import { parseArticleDocument } from "@/lib/cms-content";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
  object_key: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: unknown;
  hero_asset_id: string | null;
  status: string;
  published_at: Date | null;
  scheduled_for: Date | null;
  author_user_id: string;
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const [postResult, assetResult] = await Promise.all([
    db.query<PostRow>(
      `
        SELECT id, slug, title, excerpt, body, hero_asset_id, status, scheduled_for,
          published_at, author_user_id
        FROM cms_posts
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    ),
    db.query<AssetRow>(
      `
        SELECT id, original_name, object_key
        FROM cms_assets
        WHERE mime_type LIKE 'image/%' AND status = 'ready'
        ORDER BY created_at DESC
      `,
    ),
  ]);
  const row = postResult.rows[0];
  if (!row || (session.role === "contributor" && row.author_user_id !== session.user.id)) notFound();

  const post: EditablePost = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: parseArticleDocument(row.body),
    coverAssetId: row.hero_asset_id ?? "",
    status: row.status,
    publishedAt: (row.status === "scheduled" ? row.scheduled_for : row.published_at)?.toISOString() ?? "",
  };

  return (
    <div>
      <Link href="/admin/news" className="text-sm font-bold text-blue/55 hover:text-blue">← News articles</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-blue">Edit article</h1>
      <div className="mt-7">
        <NewsEditor
          post={post}
          assets={assetResult.rows.map((asset) => ({
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
