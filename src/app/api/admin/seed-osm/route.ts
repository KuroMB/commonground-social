import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// OSM amenity tags we care about
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const RELEVANT_TAGS = [
  '["amenity"="tool_library"]',
  '["amenity"="community_centre"]',
  '["amenity"="social_facility"]',
  '["amenity"="food_bank"]',
  '["landuse"="allotments"]',
  '["leisure"="garden"]["access"~"yes|permissive"]',
];

function buildOverpassQuery(bbox: string) {
  const parts = RELEVANT_TAGS.flatMap((tag) => [
    `node${tag}(${bbox});`,
    `way${tag}(${bbox});`,
  ]);
  return `[out:json][timeout:45];\n(\n  ${parts.join("\n  ")}\n);\nout center body;`;
}

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lat      = parseFloat(searchParams.get("lat")       ?? "38.627");
  const lng      = parseFloat(searchParams.get("lng")       ?? "-90.199");
  const radiusKm = parseFloat(searchParams.get("radius_km") ?? "40");

  // Rough bounding box from radius
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const bbox = `${lat - dLat},${lng - dLng},${lat + dLat},${lng + dLng}`;

  let overpassRes: Response | null = null;
  let usedEndpoint = "";
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: buildOverpassQuery(bbox),
        headers: { "Content-Type": "text/plain" },
      });
      if (res.ok) { overpassRes = res; usedEndpoint = endpoint; break; }
    } catch {
      // try next mirror
    }
  }

  if (!overpassRes) {
    return NextResponse.json({ error: "All Overpass mirrors unavailable — try again in a few minutes" }, { status: 502 });
  }

  const { elements }: { elements: OsmElement[] } = await overpassRes.json();
  void usedEndpoint;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let inserted = 0;
  let skipped  = 0;

  for (const el of elements) {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    const name  = el.tags?.name;

    if (!elLat || !elLng || !name) { skipped++; continue; }

    const slug = `osm-${el.type}-${el.id}`;

    const addrParts = [
      el.tags?.["addr:housenumber"],
      el.tags?.["addr:street"],
      el.tags?.["addr:city"],
      el.tags?.["addr:state"],
    ].filter(Boolean);

    const { error } = await supabase.from("places").upsert({
      slug,
      name,
      lat:        elLat,
      lng:        elLng,
      osm_id:     `${el.type}/${el.id}`,
      trust_tier: "osm",
      is_public:  true,
      address:    addrParts.length ? addrParts.join(" ") : null,
      zip_code:   el.tags?.["addr:postcode"] ?? null,
      website:    el.tags?.website ?? el.tags?.url ?? null,
      description: el.tags?.description ?? null,
      created_by: null,
    }, { onConflict: "slug" });

    if (error) { console.error(`osm insert error (${name}):`, error.message); skipped++; }
    else inserted++;
  }

  return NextResponse.json({
    message:  `Done. ${inserted} places inserted/updated, ${skipped} skipped.`,
    inserted,
    skipped,
    osm_total: elements.length,
  });
}
