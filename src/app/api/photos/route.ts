import { NextResponse } from "next/server";
import { getPublishedPhotosPage, PHOTO_PAGE_SIZE } from "@/lib/public-media";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? String(PHOTO_PAGE_SIZE));
  const query = searchParams.get("q") ?? "";

  if (!Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit < 1) {
    return NextResponse.json({ message: "Invalid pagination." }, { status: 400 });
  }

  const page = await getPublishedPhotosPage({
    offset,
    limit,
    query,
  });

  return NextResponse.json(page, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
