import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoEditor, type EditableVideo } from "@/components/admin/video-editor";
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

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  provider: "youtube" | "vimeo";
  external_url: string;
  thumbnail_asset_id: string | null;
  status: string;
  published_at: Date | null;
  created_by: string;
};

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const [videoResult, assetResult] = await Promise.all([
    db.query<VideoRow>(
      `
        SELECT id, slug, title, description, provider, external_url, thumbnail_asset_id,
          status, published_at, created_by
        FROM cms_videos
        WHERE id = $1
        LIMIT 1
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
  const row = videoResult.rows[0];
  if (
    !row ||
    (session.role === "contributor" &&
      (row.created_by !== session.user.id || !isContributorEditable(row.status)))
  ) {
    notFound();
  }

  const video: EditableVideo = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    provider: row.provider,
    externalUrl: row.external_url,
    thumbnailAssetId: row.thumbnail_asset_id ?? "",
    status: row.status,
    publishedAt: row.published_at?.toISOString() ?? "",
  };

  return (
    <div>
      <Link href="/admin/videos" className="text-sm font-bold text-gray hover:text-blue">
        ← Videos
      </Link>
      <h1 className="headline mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">
        Edit video
      </h1>
      <div className="mt-8">
        <VideoEditor
          video={video}
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
