import type { Metadata } from "next";
import { MediaHub } from "@/components/sections/media-hub";
import { getPublishedNewsPosts } from "@/lib/public-news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tennis News",
  description: "Stories from Tennista Foundation tournaments, clinics, and the wider game.",
  alternates: { canonical: "/media/tennis-news" },
};

export default async function TennisNewsPage() {
  const posts = await getPublishedNewsPosts();
  return (
    <MediaHub
      initialTab="news"
      newsItems={posts.map((post) => ({
        title: post.title,
        image: post.cardImage,
        href: `/media/tennis-news/${post.slug}`,
      }))}
    />
  );
}
