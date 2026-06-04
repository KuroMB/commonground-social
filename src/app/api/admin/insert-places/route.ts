import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function POST(request: Request) {
  const body = await request.json();

  if (!process.env.SEED_SECRET || body.secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const elements: OsmElement[] = body.elements ?? [];

  const supabase = createClient(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
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
      lat:         elLat,
      lng:         elLng,
      osm_id:      `${el.type}/${el.id}`,
      trust_tier:  "osm",
      is_public:   true,
      address:     addrParts.length ? addrParts.join(" ") : null,
      zip_code:    el.tags?.["addr:postcode"] ?? null,
      website:     el.tags?.website ?? el.tags?.url ?? null,
      description: el.tags?.description ?? null,
      created_by:  null,
    }, { onConflict: "slug" });

    if (error) { console.error(`insert error (${name}):`, error.message); skipped++; }
    else inserted++;
  }

  return NextResponse.json({
    message:   `Done. ${inserted} inserted/updated, ${skipped} skipped.`,
    inserted,
    skipped,
    osm_total: elements.length,
  });
}
