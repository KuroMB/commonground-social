"use client";

import { useEffect, useRef, useState } from "react";
import type { MapPin } from "@/app/api/map/route";
import type { Map as LeafletMap } from "leaflet";

const PIN_COLORS: Record<string, string> = {
  resource: "#1c1917",  // stone-900 — offering
  need:     "#d97706",  // amber-600 — needed
  vision:   "#2563eb",  // blue-600  — project
  place:    "#059669",  // emerald-600 — supernode
};

const STATUS_LABEL: Record<string, string> = {
  proposed:    "Proposed",
  active:      "Active",
  funded:      "Funded",
  in_progress: "In Progress",
  completed:   "Completed",
  self:        "Listed",
  community:   "Community Verified",
  osm:         "OSM Verified",
  manual:      "Verified",
  partner:     "Partner",
};

interface Props {
  initialLat?: number;
  initialLng?: number;
  types: string[];
  categories: string[];
  onPinSelect: (pin: MapPin | null) => void;
}

export default function Map({
  initialLat = 38.627,
  initialLng = -90.199,
  types,
  categories,
  onPinSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const markersRef   = useRef<L.CircleMarker[]>([]);
  const [pins, setPins]     = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(false);

  // Boot the map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(containerRef.current!, {
        center:    [initialLat, initialLng],
        zoom:      14,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("moveend", fetchPins);
      fetchPins();
    }

    init();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (mapRef.current) fetchPins();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, categories]);

  async function fetchPins() {
    const map = mapRef.current;
    if (!map) return;
    setLoading(true);

    const center = map.getCenter();
    const params = new URLSearchParams({
      lat:    String(center.lat),
      lng:    String(center.lng),
      radius: "16000",
      types:  types.join(","),
      ...(categories.length ? { categories: categories.join(",") } : {}),
    });

    const res  = await fetch(`/api/map?${params}`);
    const data = (await res.json()) as MapPin[];
    setPins(data);
    setLoading(false);
  }

  // Render pins whenever they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    import("leaflet").then(({ default: L }) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      pins.forEach((pin) => {
        const color = PIN_COLORS[pin.type] ?? "#1c1917";
        const radius = pin.type === "place" ? 10 : 7;
        const marker = L.circleMarker([pin.lat, pin.lng], {
          radius,
          color:       "white",
          weight:      2,
          fillColor:   color,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.on("click", () => onPinSelect(pin));
        markersRef.current.push(marker);
      });
    });
  }, [pins, onPinSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-3 py-1 text-xs text-stone-500 shadow-sm pointer-events-none">
          Loading…
        </div>
      )}
    </div>
  );
}
