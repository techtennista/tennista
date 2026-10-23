import type { Metadata } from "next";
import { MediaHub } from "@/components/sections/media-hub";
import { getPublishedVideos } from "@/lib/public-media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Gallery",
  description: "Video from Tennista Foundation clinics, matches, and events.",
  alternates: { canonical: "/media/video-gallery" },
};

export default async function VideoGalleryPage() {
  const videos = await getPublishedVideos();
  return <MediaHub initialTab="videos" videoItems={videos} />;
}
