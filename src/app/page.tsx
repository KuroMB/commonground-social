"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MapPin } from "@/app/api/map/route";
import MapFilters from "@/components/MapFilters";
import MapDetailPanel from "@/components/MapDetailPanel";
import IHaveButton from "@/components/IHaveButton";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const ALL_TYPES = ["resource", "need", "vision", "place"];

export default function Home() {
  const [types, setTypes]           = useState<string[]>(ALL_TYPES);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* Full-screen map */}
      <Map
        types={types}
        categories={categories}
        onPinSelect={setSelectedPin}
      />

      {/* Floating wordmark */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none select-none">
        <span className="text-sm font-semibold text-stone-900 bg-white/80 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm">
          CommonGround
        </span>
      </div>

      {/* Filter bar */}
      <MapFilters
        types={types}
        categories={categories}
        onTypesChange={setTypes}
        onCategoriesChange={setCategories}
      />

      {/* Detail panel — slides up from bottom on pin select */}
      <MapDetailPanel pin={selectedPin} onClose={() => setSelectedPin(null)} />

      {/* I have… CTA — bottom right, above iOS home indicator */}
      <div className="absolute bottom-24 right-4 z-[1000]">
        <IHaveButton size="md" />
      </div>

    </div>
  );
}
