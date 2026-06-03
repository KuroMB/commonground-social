"use client";

import { useState } from "react";

const RELEVANT_TAGS = [
  '["amenity"="tool_library"]',
  '["amenity"="community_centre"]',
  '["amenity"="social_facility"]',
  '["amenity"="food_bank"]',
  '["landuse"="allotments"]',
  '["leisure"="garden"]["access"~"yes|permissive"]',
];

function buildQuery(bbox: string) {
  const parts = RELEVANT_TAGS.flatMap((tag) => [
    `node${tag}(${bbox});`,
    `way${tag}(${bbox});`,
  ]);
  return `[out:json][timeout:60];\n(\n  ${parts.join("\n  ")}\n);\nout center body;`;
}

export default function SeedPage() {
  const [secret, setSecret]   = useState("");
  const [lat, setLat]         = useState("38.627");
  const [lng, setLng]         = useState("-90.199");
  const [radiusKm, setRadius] = useState("40");
  const [log, setLog]         = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function run() {
    setLog([]);
    setRunning(true);

    const dLat = Number(radiusKm) / 111;
    const dLng = Number(radiusKm) / (111 * Math.cos((Number(lat) * Math.PI) / 180));
    const bbox = `${Number(lat) - dLat},${Number(lng) - dLng},${Number(lat) + dLat},${Number(lng) + dLng}`;

    addLog("Querying OpenStreetMap Overpass API…");

    let elements: unknown[] = [];
    const mirrors = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let fetched = false;
    for (const mirror of mirrors) {
      try {
        addLog(`Trying ${mirror}…`);
        const res = await fetch(mirror, {
          method: "POST",
          body: buildQuery(bbox),
        });
        if (res.ok) {
          const data = await res.json();
          elements = data.elements ?? [];
          addLog(`Got ${elements.length} OSM elements.`);
          fetched = true;
          break;
        }
        addLog(`${mirror} returned ${res.status} — trying next…`);
      } catch {
        addLog(`${mirror} failed — trying next…`);
      }
    }

    if (!fetched) {
      addLog("All Overpass mirrors failed. Try again in a few minutes.");
      setRunning(false);
      return;
    }

    addLog("Sending to database…");
    const res = await fetch("/api/admin/insert-places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, elements }),
    });

    const result = await res.json();
    if (result.error) {
      addLog(`Error: ${result.error}`);
    } else {
      addLog(result.message);
    }
    setRunning(false);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12 space-y-6 font-mono text-sm">
      <h1 className="text-lg font-bold">OSM Seed Import</h1>

      <div className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Seed secret" type="password" value={secret} onChange={e => setSecret(e.target.value)} />
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" placeholder="Lat" value={lat} onChange={e => setLat(e.target.value)} />
          <input className="flex-1 border rounded px-3 py-2" placeholder="Lng" value={lng} onChange={e => setLng(e.target.value)} />
          <input className="w-20 border rounded px-3 py-2" placeholder="km" value={radiusKm} onChange={e => setRadius(e.target.value)} />
        </div>
        <button
          onClick={run}
          disabled={running || !secret}
          className="w-full bg-stone-900 text-white rounded px-4 py-2 disabled:opacity-40"
        >
          {running ? "Running…" : "Run import"}
        </button>
      </div>

      {log.length > 0 && (
        <div className="bg-stone-100 rounded p-4 space-y-1 text-xs text-stone-700">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </main>
  );
}
