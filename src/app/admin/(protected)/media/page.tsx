import { MediaLibrary } from "@/components/admin/media-library";

export const metadata = {
  title: "Media library",
};

export default function AdminMediaPage() {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-bright">Content</p>
      <h1 className="headline mt-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-blue">Media library</h1>
      <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-gray">
        Paste a public Google Drive or Google Photos link, or upload original files to reuse across news, galleries, events, and reports.
      </p>
      <MediaLibrary />
    </>
  );
}
