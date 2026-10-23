import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryEditor, type EditableGallery } from "@/components/admin/gallery-editor";
import { requireAdmin } from "@/lib/admin-session";
import { isContributorEditable } from "@/lib/admin-content";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
  object_key: string;
};

type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_asset_id: string | null;
  status: string;
  published_at: Date | null;
  created_by: string;
};

type GalleryItemRow = {
  asset_id: string;
  caption: string | null;
};

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const [galleryResult, itemResult, assetResult] = await Promise.all([
    db.query<GalleryRow>(
      `
        SELECT id, slug, title, description, cover_asset_id, status, published_at, created_by
        FROM cms_galleries
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    ),
    db.query<GalleryItemRow>(
      `
        SELECT asset_id, caption
        FROM cms_gallery_items
        WHERE gallery_id = $1
        ORDER BY sort_order, asset_id
      `,
      [id],
    ),
    db.query<AssetRow>(
      `
        SELECT id, original_name, object_key
        FROM cms_assets
        WHERE status = 'ready' AND mime_type LIKE 'image/%'
        ORDER BY created_at DESC
      `,
    ),
  ]);
  const row = galleryResult.rows[0];
  if (
    !row ||
    (session.role === "contributor" &&
      (row.created_by !== session.user.id || !isContributorEditable(row.status)))
  ) {
    notFound();
  }

  const gallery: EditableGallery = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    coverAssetId: row.cover_asset_id ?? "",
    status: row.status,
    publishedAt: row.published_at?.toISOString() ?? "",
    items: itemResult.rows.map((item) => ({
      assetId: item.asset_id,
      caption: item.caption ?? "",
    })),
  };

  return (
    <div>
      <Link href="/admin/galleries" className="text-sm font-bold text-gray hover:text-blue">
        ← Photo galleries
      </Link>
      <h1 className="headline mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">
        Edit gallery
      </h1>
      <div className="mt-8">
        <GalleryEditor
          gallery={gallery}
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
