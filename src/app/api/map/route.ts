import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type MapPin = {
  id: string;
  type: "resource" | "need" | "vision" | "place";
  lat: number;
  lng: number;
  title: string;
  category?: string;
  status?: string;
  listing_type?: string;
  notes?: string;
  owner?: string;
  photo_path?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat   = parseFloat(searchParams.get("lat")    ?? "");
  const lng   = parseFloat(searchParams.get("lng")    ?? "");
  const radius = parseInt(searchParams.get("radius")  ?? "8047", 10); // 5 miles
  const types  = (searchParams.get("types") ?? "resource,place,vision,need").split(",");
  const cats   = searchParams.get("categories")?.split(",") ?? [];

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const supabase = await createClient();
  const pins: MapPin[] = [];

  // ── Resources & Needs ──────────────────────────────────────────
  if (types.includes("resource") || types.includes("need")) {
    const wantedTypes = types.filter((t) => t === "resource" || t === "need")
      .map((t) => (t === "resource" ? "offer" : "need"));

    let q = supabase
      .from("resource_locations")
      .select("id, listing_type, notes, zip_code, owner_name, category, location, radius_meters")
      .filter("is_available", "eq", true)
      .filter("listing_type", "in", `(${wantedTypes.map((t) => `"${t}"`).join(",")})`)
      // PostGIS distance filter via RPC not available without postgis on anon key —
      // fall back to bounding-box approximation until the migration is live.
      .not("location", "is", null);

    if (cats.length) q = q.in("category", cats);

    // Fetch and filter client-side for the bounding box (lat/lng approx)
    const { data } = await q.limit(500);

    const degRadius = radius / 111_320;
    (data ?? []).forEach((r: Record<string, unknown>) => {
      if (!r.location) return;
      const { coordinates } = r.location as { coordinates: [number, number] };
      const [rLng, rLat] = coordinates;
      if (
        Math.abs(rLat - lat) > degRadius ||
        Math.abs(rLng - lng) > degRadius * 1.5
      ) return;

      pins.push({
        id:           r.id as string,
        type:         r.listing_type === "need" ? "need" : "resource",
        lat:          rLat,
        lng:          rLng,
        title:        (r.canonical_tag_name ?? r.category ?? "Resource") as string,
        category:     r.category as string,
        listing_type: r.listing_type as string,
        notes:        r.notes as string | undefined,
        owner:        r.owner_name as string | undefined,
      });
    });
  }

  // ── Places / Supernodes ────────────────────────────────────────
  if (types.includes("place")) {
    const { data } = await supabase
      .from("places")
      .select("id, name, lat, lng, trust_tier")
      .eq("is_public", true)
      .not("lat", "is", null)
      .limit(200);

    const degRadius = radius / 111_320;
    (data ?? []).forEach((p: Record<string, unknown>) => {
      const pLat = p.lat as number;
      const pLng = p.lng as number;
      if (
        Math.abs(pLat - lat) > degRadius ||
        Math.abs(pLng - lng) > degRadius * 1.5
      ) return;
      pins.push({
        id:     p.id as string,
        type:   "place",
        lat:    pLat,
        lng:    pLng,
        title:  p.name as string,
        status: p.trust_tier as string,
      });
    });
  }

  // ── Visions ────────────────────────────────────────────────────
  if (types.includes("vision")) {
    const { data } = await supabase
      .from("visions")
      .select("id, title, lat, lng, status")
      .in("status", ["proposed", "active", "funded", "in_progress", "completed"])
      .not("lat", "is", null)
      .limit(200);

    const degRadius = radius / 111_320;
    (data ?? []).forEach((v: Record<string, unknown>) => {
      const vLat = v.lat as number;
      const vLng = v.lng as number;
      if (
        Math.abs(vLat - lat) > degRadius ||
        Math.abs(vLng - lng) > degRadius * 1.5
      ) return;
      pins.push({
        id:     v.id as string,
        type:   "vision",
        lat:    vLat,
        lng:    vLng,
        title:  v.title as string,
        status: v.status as string,
      });
    });
  }

  return NextResponse.json(pins);
}
