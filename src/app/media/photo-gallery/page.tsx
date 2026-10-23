import type { Metadata } from "next";
import { MediaHub } from "@/components/sections/media-hub";
import { getPublishedPhotosPage } from "@/lib/public-media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Photos from Tennista Foundation courts, clinics, and tournaments.",
  alternates: { canonical: "/media/photo-gallery" },
};

export default async function PhotoGalleryPage() {
  const photoFeed = await getPublishedPhotosPage();
  return <MediaHub initialTab="photos" photoFeed={photoFeed} />;
}
