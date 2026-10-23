import type { Metadata } from "next";
import { MediaHub } from "@/components/sections/media-hub";
import { getPublishedEvents } from "@/lib/public-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Tennista Foundation events and tournament dates.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return <MediaHub initialTab="events" eventItems={events} />;
}
