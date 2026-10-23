import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  external_url: string;
  status: string;
  updated_at: Date;
  thumbnail_object_key: string | null;
};

export default async function AdminVideosPage() {
  const session = await requireAdmin();
  const result = await db.query<VideoRow>(
    `
      SELECT v.id, v.slug, v.title, v.provider, v.external_url, v.status, v.updated_at,
        thumbnail.object_key AS thumbnail_object_key
      FROM cms_videos v
      LEFT JOIN cms_assets thumbnail ON thumbnail.id = v.thumbnail_asset_id
      WHERE ($1::BOOLEAN = FALSE OR (v.created_by = $2 AND v.status IN ('draft', 'review')))
      ORDER BY v.updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-bright">Media</p>
          <h1 className="headline mt-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">
            Videos
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-gray">
            Manage YouTube and Vimeo entries, thumbnails, and publication state.
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-[#123e96]"
        >
          New video
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1rem] border border-blue/10 bg-white">
        {result.rows.length ? (
          <div className="divide-y divide-blue/10">
            {result.rows.map((video) => (
              <Link
                key={video.id}
                href={`/admin/videos/${video.id}`}
                className="grid cursor-pointer gap-4 p-4 transition hover:bg-blue-tint/40 sm:grid-cols-[7rem_minmax(0,1fr)_6rem_8rem_9rem] sm:items-center"
              >
                <div className="aspect-video overflow-hidden rounded-[0.65rem] bg-blue-tint">
                  {video.thumbnail_object_key ? (
                    <img
                      src={publicAssetUrl(video.thumbnail_object_key)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-blue">{video.title}</h2>
                  <p className="mt-1 truncate text-xs text-gray">/{video.slug}</p>
                </div>
                <span className="text-sm font-semibold capitalize text-gray">{video.provider}</span>
                <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">
                  {video.status === "review" ? "In review" : video.status}
                </span>
                <time className="text-xs text-gray">
                  Updated{" "}
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                    video.updated_at,
                  )}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-bold text-blue">No videos yet</h2>
            <p className="mt-2 text-sm text-gray">Add a YouTube or Vimeo video.</p>
          </div>
        )}
      </div>
    </div>
  );
}
