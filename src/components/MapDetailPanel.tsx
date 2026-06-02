"use client";

import type { MapPin } from "@/app/api/map/route";

const TYPE_LABEL: Record<string, string> = {
  resource: "Resource",
  need:     "Need",
  vision:   "Vision",
  place:    "Place",
};

const TYPE_COLOR: Record<string, string> = {
  resource: "bg-stone-900 text-white",
  need:     "bg-amber-500 text-white",
  vision:   "bg-blue-600 text-white",
  place:    "bg-emerald-600 text-white",
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
  pin: MapPin | null;
  onClose: () => void;
}

export default function MapDetailPanel({ pin, onClose }: Props) {
  if (!pin) return null;

  const entityPath =
    pin.type === "place"    ? `/places/${pin.id}` :
    pin.type === "vision"   ? `/visions/${pin.id}` :
    `/resources/${pin.id}`;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLOR[pin.type]}`}>
              {TYPE_LABEL[pin.type]}
            </span>
            {pin.category && (
              <span className="text-xs text-stone-400 capitalize">{pin.category}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors leading-none text-lg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 space-y-2">
          <h2 className="text-base font-semibold text-stone-900 leading-snug">
            {pin.title}
          </h2>

          {pin.notes && (
            <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
              {pin.notes}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-stone-400">
            {pin.owner && <span>{pin.owner}</span>}
            {pin.status && STATUS_LABEL[pin.status] && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5">
                {STATUS_LABEL[pin.status]}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-4 py-3">
          <a
            href={entityPath}
            className="block w-full text-center rounded-xl bg-stone-900 text-white text-sm font-medium py-2.5 hover:bg-stone-700 transition-colors"
          >
            View details
          </a>
        </div>

      </div>
    </div>
  );
}
