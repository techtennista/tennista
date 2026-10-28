import Link from "next/link";
import { VideoEditor } from "@/components/admin/video-editor";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  original_name: string;
  object_key: string;
  mime_type: string;
};

export default async function NewVideoPage() {
  const session = await requireAdmin();
  const result = await db.query<AssetRow>(
    `
      SELECT id, original_name, object_key, mime_type
      FROM cms_assets
      WHERE status = 'ready' AND (mime_type LIKE 'image/%' OR mime_type LIKE 'video/%')
      ORDER BY created_at DESC
    `,
  );
  const images = result.rows.filter((asset) => asset.mime_type.startsWith("image/"));
  const videos = result.rows.filter((asset) => asset.mime_type.startsWith("video/"));

  return (
    <div>
      <Link href="/admin/videos" className="text-sm font-bold text-gray hover:text-blue">
        ← Videos
      </Link>
      <h1 className="headline mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">
        New video
      </h1>
      <div className="mt-8">
        <VideoEditor
          assets={images.map((asset) => ({
            id: asset.id,
            filename: asset.original_name,
            publicUrl: publicAssetUrl(asset.object_key),
          }))}
          videoAssets={videos.map((asset) => ({
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
