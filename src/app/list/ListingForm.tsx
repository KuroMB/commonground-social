"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing, type ResourceState } from "@/app/actions/resource";
import Link from "next/link";

type Tag = { id: string; slug: string; display_name: string; is_consumable: boolean };

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  tools:     ["tool", "drill", "saw", "ladder", "mower", "wrench", "shovel", "equipment"],
  space:     ["space", "room", "garage", "yard", "garden", "parking", "storage", "kitchen"],
  materials: ["material", "lumber", "wood", "soil", "seed", "box", "paint", "supply", "fabric"],
  labor:     ["labor", "help", "haul", "move", "install", "repair", "build", "clean", "teach"],
  knowledge: ["knowledge", "skill", "lesson", "advice", "consult", "tutor", "coach"],
};

function scoreTag(tag: Tag, category?: string): number {
  if (!category) return 0;
  const keywords = CATEGORY_KEYWORDS[category] ?? [];
  const name = tag.display_name.toLowerCase();
  return keywords.some((k) => name.includes(k)) ? 1 : 0;
}

const INITIAL: ResourceState = {};

export default function ListingForm({
  tags,
  defaultCategory,
}: {
  tags: Tag[];
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createListing, INITIAL);
  const [selected, setSelected] = useState<Tag | null>(null);
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState<"offer" | "need">("offer");

  useEffect(() => {
    if (state.id) router.push("/");
  }, [state.id, router]);

  const filtered = tags
    .filter((t) =>
      !search || t.display_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => scoreTag(b, defaultCategory) - scoreTag(a, defaultCategory));

  if (state.id) {
    return (
      <div className="text-center space-y-3 py-8">
        <p className="text-stone-900 font-medium">Listed! Your pin will appear on the map.</p>
        <Link href="/" className="text-sm text-stone-500 underline">Back to map</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="listing_type" value={listingType} />
      {selected && <input type="hidden" name="canonical_tag_id" value={selected.id} />}

      {/* Offer / Need toggle */}
      <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => setListingType("offer")}
          className={`flex-1 py-2.5 transition-colors ${listingType === "offer" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"}`}
        >
          I have it
        </button>
        <button
          type="button"
          onClick={() => setListingType("need")}
          className={`flex-1 py-2.5 transition-colors ${listingType === "need" ? "bg-amber-500 text-white" : "text-stone-500 hover:bg-stone-50"}`}
        >
          I need it
        </button>
      </div>

      {/* Tag picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">What is it?</label>

        {selected ? (
          <div className="flex items-center justify-between rounded-xl border border-stone-900 bg-stone-50 px-4 py-3">
            <span className="text-sm font-medium text-stone-900">{selected.display_name}</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-stone-400 hover:text-stone-600 underline"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
            />
            <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 divide-y divide-stone-100">
              {filtered.slice(0, 30).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => { setSelected(tag); setSearch(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-stone-800 hover:bg-stone-50 transition-colors"
                >
                  {tag.display_name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-stone-400">No match — try different words.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">
          Details <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          maxLength={500}
          placeholder={listingType === "offer"
            ? "e.g. 8ft aluminum ladder, good condition"
            : "e.g. need for weekend, ladder or step stool works"}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 resize-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !selected}
        className="w-full rounded-xl bg-stone-900 text-white text-sm font-medium py-3 hover:bg-stone-700 disabled:opacity-40 transition-colors"
      >
        {pending ? "Posting…" : "Post listing"}
      </button>

      <p className="text-center text-xs text-stone-400">
        <Link href="/" className="underline hover:text-stone-600">Cancel</Link>
      </p>
    </form>
  );
}
