import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updated_at: Date;
  published_at: Date | null;
  cover_object_key: string | null;
  item_count: number;
};

export default async function AdminGalleriesPage() {
  const session = await requireAdmin();
  const result = await db.query<GalleryRow>(
    `
      SELECT g.id, g.slug, g.title, g.status, g.updated_at, g.published_at,
        cover.object_key AS cover_object_key, COUNT(gi.asset_id)::INTEGER AS item_count
      FROM cms_galleries g
      LEFT JOIN cms_assets cover ON cover.id = g.cover_asset_id
      LEFT JOIN cms_gallery_items gi ON gi.gallery_id = g.id
      WHERE ($1::BOOLEAN = FALSE OR (g.created_by = $2 AND g.status IN ('draft', 'review')))
      GROUP BY g.id, cover.object_key
      ORDER BY g.updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-bright">Media</p>
          <h1 className="headline mt-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">
            Photo galleries
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-gray">
            Curate image collections, captions, cover art, and publication state.
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white hover:bg-[#123e96]"
        >
          New gallery
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1rem] border border-blue/10 bg-white">
        {result.rows.length ? (
          <div className="divide-y divide-blue/10">
            {result.rows.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/admin/galleries/${gallery.id}`}
                className="grid cursor-pointer gap-4 p-4 transition hover:bg-blue-tint/40 sm:grid-cols-[6rem_minmax(0,1fr)_7rem_8rem_9rem] sm:items-center"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-[0.65rem] bg-blue-tint">
                  {gallery.cover_object_key ? (
                    <img
                      src={publicAssetUrl(gallery.cover_object_key)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-blue">{gallery.title}</h2>
                  <p className="mt-1 truncate text-xs text-gray">/{gallery.slug}</p>
                </div>
                <span className="text-sm font-semibold text-gray">
                  {gallery.item_count} {gallery.item_count === 1 ? "image" : "images"}
                </span>
                <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">
                  {gallery.status === "review" ? "In review" : gallery.status}
                </span>
                <time className="text-xs text-gray">
                  Updated{" "}
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                    gallery.updated_at,
                  )}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-bold text-blue">No galleries yet</h2>
            <p className="mt-2 text-sm text-gray">Create a gallery from images in the media library.</p>
          </div>
        )}
      </div>
    </div>
  );
}
