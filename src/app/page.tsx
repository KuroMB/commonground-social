"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IHaveButton from "@/components/IHaveButton";

export default function Home() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Enter a 5-digit US zip code.");
      return;
    }
    router.push(`/${trimmed}`);
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-24">
      <div className="max-w-xl w-full space-y-10">

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
            CommonGround
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            Your neighbor has a drill. You need a drill. That&apos;s it.
          </p>
          <p className="text-stone-500 leading-relaxed">
            A resource pool for your block — tools, space, materials, skills.
            No algorithm, no ads, no chat.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* I need… */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-700">I need something</p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Zip code"
                value={zip}
                onChange={(e) => { setZip(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
              <button
                type="submit"
                className="w-full rounded-lg border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:border-stone-500 hover:bg-stone-100 transition-colors"
              >
                Browse nearby
              </button>
            </form>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          {/* I have… */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-700">I have something</p>
            <p className="text-sm text-stone-500">
              List what you can share and let neighbors find you.
            </p>
            <IHaveButton size="md" className="w-full" />
          </div>

        </div>

        <div className="border-t border-stone-200 pt-8 space-y-3 text-sm text-stone-500">
          <p className="font-medium text-stone-700">How it works</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Browse resources in your area — no account needed</li>
            <li>See something you need? Send a connection request</li>
            <li>The owner gets a notification and decides whether to connect</li>
            <li>You coordinate offline. Done.</li>
          </ol>
        </div>

      </div>
    </main>
  );
}
