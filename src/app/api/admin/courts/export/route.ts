import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() ?? "";
  const query = searchParams.get("q")?.trim() ?? "";

  const result = await db.query<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    source: string;
    moderation_status: string;
    phone: string | null;
    website_url: string | null;
    active: boolean;
    updated_at: Date;
  }>(
    `
      SELECT id::text, name, address, city, state, country, latitude, longitude,
        source, moderation_status, phone, website_url, active, updated_at
      FROM tennis_courts
      WHERE ($1 = '' OR moderation_status = $1)
        AND (
          $2 = ''
          OR name ILIKE '%' || $2 || '%'
          OR city ILIKE '%' || $2 || '%'
          OR state ILIKE '%' || $2 || '%'
          OR country ILIKE '%' || $2 || '%'
        )
      ORDER BY updated_at DESC
      LIMIT 10000
    `,
    [status, query],
  );

  const header = [
    "id",
    "name",
    "address",
    "city",
    "state",
    "country",
    "latitude",
    "longitude",
    "source",
    "moderation_status",
    "phone",
    "website_url",
    "active",
    "updated_at",
  ];

  const lines = [
    header.join(","),
    ...result.rows.map((row) =>
      [
        row.id,
        row.name,
        row.address,
        row.city,
        row.state,
        row.country,
        row.latitude,
        row.longitude,
        row.source,
        row.moderation_status,
        row.phone,
        row.website_url,
        row.active,
        row.updated_at.toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tennista-courts-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
