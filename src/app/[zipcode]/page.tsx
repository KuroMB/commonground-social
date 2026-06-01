import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Resource {
  id: string;
  notes: string | null;
  zip_code: string;
  canonical_tags: {
    slug: string;
    display_name: string;
    is_consumable: boolean;
    category: string;
  };
  profiles: {
    display_name: string;
    neighborhood: string | null;
  } | null;
  places: {
    name: string;
    neighborhood?: string | null;
  } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  tools: "Tools",
  space: "Space",
  materials: "Materials",
  labor: "Labor & Skills",
  knowledge: "Knowledge",
  capital: "Capital",
};

export default async function ZipPage({
  params,
}: {
  params: Promise<{ zipcode: string }>;
}) {
  const { zipcode } = await params;

  if (!/^\d{5}$/.test(zipcode)) {
    notFound();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_resources")
    .select(`
      id,
      notes,
      zip_code,
      canonical_tags (slug, display_name, is_consumable, category),
      profiles (display_name, neighborhood),
      places (name)
    `)
    .eq("zip_code", zipcode)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const resources = (data as unknown as Resource[]) ?? [];

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    const cat = r.canonical_tags.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const categoryOrder = ["tools", "space", "materials", "labor", "knowledge", "capital"];

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">
          ← CommonGround
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">
          Resources available in {zipcode}
        </h1>
        {resources.length === 0 ? (
          <p className="text-stone-500">
            Nothing listed here yet.{" "}
            <Link href="/join" className="underline hover:text-stone-700">
              Be the first to add something.
            </Link>
          </p>
        ) : (
          <p className="text-stone-500">
            {resources.length} {resources.length === 1 ? "resource" : "resources"} available
          </p>
        )}
      </div>

      {categoryOrder
        .filter((cat) => grouped[cat]?.length > 0)
        .map((cat) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              {CATEGORY_LABELS[cat]}
            </h2>
            <ul className="space-y-2">
              {grouped[cat].map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-stone-900">
                        {r.canonical_tags.display_name}
                      </span>
                      {r.canonical_tags.is_consumable && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          consumable
                        </span>
                      )}
                    </div>
                    {r.notes && (
                      <p className="text-sm text-stone-500 truncate">{r.notes}</p>
                    )}
                    <p className="text-xs text-stone-400">
                      {r.places?.name ?? r.profiles?.neighborhood ?? zipcode}
                    </p>
                  </div>
                  <Link
                    href={`/request/${r.id}`}
                    className="flex-shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white font-medium hover:bg-stone-700 transition-colors"
                  >
                    Request
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <div className="border-t border-stone-200 pt-8 text-center space-y-3">
        <p className="text-sm text-stone-500">
          Have something to share?
        </p>
        <Link
          href="/join"
          className="inline-block rounded-lg border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:border-stone-500 hover:bg-stone-100 transition-colors"
        >
          Add your resources
        </Link>
      </div>

    </main>
  );
}
