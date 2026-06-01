"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { slug: "tools",     label: "Tools",     hint: "drills, ladders, saws, mowers…" },
  { slug: "space",     label: "Space",     hint: "backyard, garage, parking, rooms…" },
  { slug: "materials", label: "Materials", hint: "lumber, soil, seeds, boxes…" },
  { slug: "labor",     label: "Labor",     hint: "hauling, moving, yard work…" },
  { slug: "knowledge", label: "Knowledge", hint: "electrical, plumbing, cooking…" },
] as const;

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function IHaveButton({ className = "", size = "md" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function pick(slug: string) {
    setOpen(false);
    router.push(`/join?category=${slug}`);
  }

  const btnSize =
    size === "lg" ? "px-8 py-4 text-base" :
    size === "sm" ? "px-4 py-2 text-sm"   :
                    "px-6 py-3 text-sm";

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-700 transition-colors ${btnSize}`}
      >
        I have&hellip;
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl bg-white border border-stone-200 shadow-lg p-3 space-y-1 z-50">
          <p className="px-2 pb-1 text-xs font-medium text-stone-400 uppercase tracking-widest">
            What do you have?
          </p>
          {CATEGORIES.map(({ slug, label, hint }) => (
            <button
              key={slug}
              onClick={() => pick(slug)}
              className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-stone-50 transition-colors group"
            >
              <span className="block text-sm font-medium text-stone-900 group-hover:text-stone-700">
                {label}
              </span>
              <span className="block text-xs text-stone-400">
                {hint}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
