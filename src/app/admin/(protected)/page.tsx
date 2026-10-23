import { db } from "@/lib/db";

type CountRow = {
  posts: string;
  events: string;
  galleries: string;
  videos: string;
  courts: string;
  submissions: string;
};

export const metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const result = await db.query<CountRow>(`
    SELECT
      (SELECT COUNT(*) FROM cms_posts WHERE status <> 'archived')::TEXT AS posts,
      (SELECT COUNT(*) FROM cms_events WHERE status <> 'archived')::TEXT AS events,
      (SELECT COUNT(*) FROM cms_galleries WHERE status <> 'archived')::TEXT AS galleries,
      (SELECT COUNT(*) FROM cms_videos WHERE status <> 'archived')::TEXT AS videos,
      (SELECT COUNT(*) FROM tennis_courts WHERE active = TRUE)::TEXT AS courts,
      (SELECT COUNT(*) FROM cms_submissions WHERE status = 'new')::TEXT AS submissions
  `);
  const counts = result.rows[0];
  const cards = [
    { label: "News posts", value: counts.posts, href: "/admin/news" },
    { label: "Events", value: counts.events, href: "/admin/events" },
    { label: "Galleries", value: counts.galleries, href: "/admin/galleries" },
    { label: "Videos", value: counts.videos, href: "/admin/videos" },
    { label: "Tennis courts", value: counts.courts, href: "/admin/courts" },
    { label: "New submissions", value: counts.submissions, href: "/admin/submissions" },
  ];

  return (
    <>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-bright">Overview</p>
        <h1 className="headline mt-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">Dashboard</h1>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-[1rem] border border-blue/10 bg-white p-5 transition hover:border-blue-bright/40"
          >
            <span className="font-display text-[2.75rem] leading-none font-extrabold text-blue">{card.value}</span>
            <span className="mt-3 block text-sm font-semibold text-gray">{card.label}</span>
          </a>
        ))}
      </div>
      <section className="mt-8 rounded-[1rem] border border-blue/10 bg-white p-6">
        <h2 className="headline text-[1.5rem] leading-none text-blue">Getting started</h2>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-gray">
          Publishing actions are authenticated, role-checked, and written to the audit log. News edits also retain a
          revision history, and imported court records stay private until an editor approves them.
        </p>
      </section>
    </>
  );
}
