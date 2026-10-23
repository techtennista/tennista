import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

type NominatimResult = {
  boundingbox: [string, string, string, string];
  display_name: string;
};

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "contributor") {
    return NextResponse.json({ error: "Only editors can import court data." }, { status: 403 });
  }

  const payload = (await request.json()) as {
    country?: unknown;
    state?: unknown;
    city?: unknown;
  };
  const country = String(payload.country ?? "").trim();
  const state = String(payload.state ?? "").trim();
  const city = String(payload.city ?? "").trim();
  if (!country || !state) {
    return NextResponse.json({ error: "Country and state are required." }, { status: 400 });
  }

  const search = new URLSearchParams({ format: "jsonv2", limit: "1", country, state });
  if (city) search.set("city", city);
  const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?${search}`, {
    headers: { "User-Agent": "TennistaFoundationCourtDirectory/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!geocodeResponse.ok) {
    return NextResponse.json({ error: "The location service is temporarily unavailable." }, { status: 502 });
  }
  const locations = (await geocodeResponse.json()) as NominatimResult[];
  const location = locations[0];
  if (!location) {
    return NextResponse.json({ error: "No matching location was found." }, { status: 404 });
  }

  const [south, north, west, east] = location.boundingbox;
  const overpassQuery = `
    [out:json][timeout:45];
    (
      nwr["sport"="tennis"](${south},${west},${north},${east});
      nwr["leisure"="pitch"]["tennis"="yes"](${south},${west},${north},${east});
    );
    out center tags;
  `;
  const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "TennistaFoundationCourtDirectory/1.0",
    },
    body: new URLSearchParams({ data: overpassQuery }),
    signal: AbortSignal.timeout(55_000),
  });
  if (!overpassResponse.ok) {
    return NextResponse.json({ error: "OpenStreetMap court search is temporarily unavailable." }, { status: 502 });
  }
  const osm = (await overpassResponse.json()) as { elements?: OsmElement[] };
  const elements = osm.elements ?? [];

  const client = await db.connect();
  let imported = 0;
  let duplicates = 0;
  try {
    await client.query("BEGIN");
    for (const element of elements) {
      const tags = element.tags ?? {};
      const externalId = `${element.type}/${element.id}`;
      const name = tags.name || tags.operator || `Tennis court ${element.id}`;
      const latitude = element.lat ?? element.center?.lat ?? null;
      const longitude = element.lon ?? element.center?.lon ?? null;
      const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
      const address = street || tags["addr:place"] || tags["contact:street"] || "Address not provided";
      const importedCity = tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || city || state;
      const importedState = tags["addr:state"] || state;
      const importedCountry = tags["addr:country"] || country;
      const insert = await client.query(
        `
          INSERT INTO tennis_courts (
            slug, name, address, city, state, country, latitude, longitude,
            source, external_id, active, moderation_status, description,
            phone, website_url, surface_types, amenities, opening_hours
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            'openstreetmap', $9, FALSE, 'pending', $10, $11, $12, $13, $14, $15
          )
          ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL
          DO NOTHING
          RETURNING id
        `,
        [
          `${slugify(name) || "tennis-court"}-${element.type}-${element.id}`,
          name,
          address,
          importedCity,
          importedState,
          importedCountry,
          latitude,
          longitude,
          externalId,
          tags.description || null,
          tags.phone || tags["contact:phone"] || null,
          tags.website || tags["contact:website"] || null,
          tags.surface ? tags.surface.split(";").map((value) => value.trim()).filter(Boolean) : [],
          [tags.lit === "yes" ? "floodlights" : null, tags.covered === "yes" ? "covered" : null].filter(Boolean),
          tags.opening_hours || null,
        ],
      );
      const isNew = Boolean(insert.rowCount);
      imported += isNew ? 1 : 0;
      duplicates += isNew ? 0 : 1;
      await client.query(
        `
          INSERT INTO cms_court_imports (source, external_id, payload, status)
          VALUES ('openstreetmap', $1, $2::jsonb, $3)
          ON CONFLICT (source, external_id)
          DO UPDATE SET payload = EXCLUDED.payload
        `,
        [externalId, JSON.stringify(element), isNew ? "pending" : "duplicate"],
      );
    }
    await client.query(
      `
        INSERT INTO cms_audit_log (actor_user_id, action, entity_type, after_state)
        VALUES ($1, 'import', 'tennis_court', $2::jsonb)
      `,
      [
        session.user.id,
        JSON.stringify({ country, state, city, found: elements.length, imported, duplicates }),
      ],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({
    location: location.display_name,
    found: elements.length,
    imported,
    duplicates,
  });
}
