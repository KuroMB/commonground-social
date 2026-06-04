import { Suspense } from "react";
import { getCanonicalTags } from "@/app/actions/resource";
import ListingForm from "./ListingForm";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const tags = await getCanonicalTags();

  return (
    <main className="max-w-sm mx-auto px-4 py-16 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-stone-900">I have…</h1>
        <p className="text-stone-500 text-sm">
          Share something with your neighbors. They&apos;ll reach out when interested.
        </p>
      </div>
      <Suspense>
        <ListingForm tags={tags} defaultCategory={category} />
      </Suspense>
    </main>
  );
}
