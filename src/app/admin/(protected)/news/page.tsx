import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { publicAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updated_at: Date;
  published_at: Date | null;
  author_user_id: string;
  cover_object_key: string | null;
};

export default async function AdminNewsPage() {
  const session = await requireAdmin();
  const result = await db.query<PostRow>(
    `
      SELECT p.id, p.slug, p.title, p.status, p.updated_at, p.published_at,
        p.author_user_id, a.object_key AS cover_object_key
      FROM cms_posts p
      LEFT JOIN cms_assets a ON a.id = p.hero_asset_id
      WHERE $1::boolean = FALSE OR p.author_user_id = $2
      ORDER BY p.updated_at DESC
    `,
    [session.role === "contributor", session.user.id],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue/45">Publishing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue">News articles</h1>
          <p className="mt-2 text-sm text-blue/60">
            Draft, review, schedule, and publish stories for the public news pages.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="cursor-pointer rounded-full bg-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123e96]"
        >
          New article
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce4f0] bg-white shadow-sm">
        {result.rows.length ? (
          <div className="divide-y divide-[#e7edf6]">
            {result.rows.map((post) => (
              <Link
                key={post.id}
                href={`/admin/news/${post.id}`}
                className="grid cursor-pointer gap-4 p-4 transition hover:bg-[#f7faff] sm:grid-cols-[5.5rem_minmax(0,1fr)_8rem_9rem] sm:items-center"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-blue-tint">
                  {post.cover_object_key ? (
                    <img src={publicAssetUrl(post.cover_object_key)} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-blue">{post.title}</h2>
                  <p className="mt-1 truncate text-xs text-blue/45">/{post.slug}</p>
                </div>
                <span className="w-fit rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-blue">
                  {post.status.replace("_", " ")}
                </span>
                <time className="text-xs text-blue/50">
                  Updated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(post.updated_at)}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-bold text-blue">No articles yet</h2>
            <p className="mt-2 text-sm text-blue/55">Create the first article or migrate the existing website stories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
