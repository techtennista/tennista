import type { Metadata } from "next";
import { MediaHub } from "@/components/sections/media-hub";
import { getPublishedEvents } from "@/lib/public-events";
import { getPublishedPhotosPage, getPublishedVideos } from "@/lib/public-media";
import { getPublishedNewsPosts } from "@/lib/public-news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media & Events",
  description: "Tennis news, photos, videos, and events from Tennista Foundation.",
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const [posts, events, photoFeed, videos] = await Promise.all([
    getPublishedNewsPosts(),
    getPublishedEvents(),
    getPublishedPhotosPage(),
    getPublishedVideos(),
  ]);
  return (
    <MediaHub
      newsItems={posts.map((post) => ({
        title: post.title,
        image: post.cardImage,
        href: `/media/tennis-news/${post.slug}`,
      }))}
      eventItems={events}
      photoFeed={photoFeed}
      videoItems={videos}
    />
  );
}
