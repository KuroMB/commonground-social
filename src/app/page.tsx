"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
            CommonGround is a place to list what you can share — tools, space,
            materials, skills — and find what your neighbors are offering. No
            algorithm, no ads, no chat. Just a resource pool for your block.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="zip" className="block text-sm font-medium text-stone-700">
            See what&apos;s available near you
          </label>
          <div className="flex gap-2">
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Zip code"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setError(""); }}
              className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-6 py-3 text-white font-medium hover:bg-stone-700 transition-colors"
            >
              Browse
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="border-t border-stone-200 pt-8 space-y-3 text-sm text-stone-500">
          <p className="font-medium text-stone-700">How it works</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Browse resources in your zip code — no account needed</li>
            <li>See something you need? Send a connection request</li>
            <li>The owner gets an email and decides whether to share their contact info</li>
            <li>You coordinate offline. Done.</li>
          </ol>
        </div>

      </div>
    </main>
  );
}
