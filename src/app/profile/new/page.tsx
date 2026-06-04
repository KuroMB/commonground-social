"use client";

import { useActionState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createProfile, type ProfileState } from "@/app/actions/profile";

const INITIAL: ProfileState = {};

function NewProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(createProfile, INITIAL);

  useEffect(() => {
    if (state.success) router.push(next);
  }, [state.success, router, next]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">
          First name or nickname
        </label>
        <input
          name="display_name"
          type="text"
          required
          autoFocus
          maxLength={40}
          placeholder="e.g. Marcus"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">
          Zip code
        </label>
        <input
          name="zip_code"
          type="text"
          required
          inputMode="numeric"
          maxLength={5}
          placeholder="63146"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">
          Neighborhood <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <input
          name="neighborhood"
          type="text"
          maxLength={60}
          placeholder="e.g. Olivette, Dogtown, South City…"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
        />
        <p className="text-xs text-stone-400">This is all that&apos;s shown publicly — never your address.</p>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-stone-900 text-white text-sm font-medium py-3 hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "Saving…" : "Let's go"}
      </button>
    </form>
  );
}

export default function NewProfilePage() {
  return (
    <main className="max-w-sm mx-auto px-4 py-24 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-900">One more thing</h1>
        <p className="text-stone-500 text-sm">
          Tell neighbors a little about who you are. No last name, no address.
        </p>
      </div>
      <Suspense>
        <NewProfileForm />
      </Suspense>
    </main>
  );
}
