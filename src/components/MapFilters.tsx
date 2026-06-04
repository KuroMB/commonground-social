"use client";

const TYPES = [
  { id: "resource", label: "Resources" },
  { id: "need",     label: "Needs"     },
  { id: "vision",   label: "Visions"   },
  { id: "place",    label: "Places"    },
] as const;

const CATEGORIES = [
  { id: "tools",     label: "Tools"     },
  { id: "space",     label: "Space"     },
  { id: "materials", label: "Materials" },
  { id: "labor",     label: "Labor"     },
  { id: "knowledge", label: "Knowledge" },
  { id: "capital",   label: "Capital"   },
] as const;

const TYPE_COLORS: Record<string, string> = {
  resource: "bg-stone-900 text-white border-stone-900",
  need:     "bg-amber-500 text-white border-amber-500",
  vision:   "bg-blue-600  text-white border-blue-600",
  place:    "bg-emerald-600 text-white border-emerald-600",
};

interface Props {
  types:         string[];
  categories:    string[];
  onTypesChange:      (t: string[]) => void;
  onCategoriesChange: (c: string[]) => void;
}

function toggle(arr: string[], id: string) {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

export default function MapFilters({ types, categories, onTypesChange, onCategoriesChange }: Props) {
  return (
    <div className="absolute top-14 left-0 right-0 z-[1000] flex flex-col items-center gap-2 pointer-events-none">

      {/* Type toggles */}
      <div className="flex gap-1.5 pointer-events-auto">
        {TYPES.map(({ id, label }) => {
          const active = types.includes(id);
          return (
            <button
              key={id}
              onClick={() => onTypesChange(toggle(types, id))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                active
                  ? TYPE_COLORS[id]
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Category toggles — only show when resources or needs active */}
      {(types.includes("resource") || types.includes("need")) && (
        <div className="flex gap-1 pointer-events-auto">
          {CATEGORIES.map(({ id, label }) => {
            const active = categories.includes(id);
            return (
              <button
                key={id}
                onClick={() => onCategoriesChange(toggle(categories, id))}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white/90 text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
