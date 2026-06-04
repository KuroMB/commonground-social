"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function JoinPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-stone-900">Check your email</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          We sent a sign-in link to <strong>{email}</strong>.<br />
          Click it to continue — no password needed.
        </p>
        <p className="text-xs text-stone-400">
          Check your spam folder if it doesn&apos;t arrive within a minute.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-stone-400 underline hover:text-stone-600"
        >
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-stone-900">Join CommonGround</h1>
        <p className="text-stone-500 text-sm">
          No password. We&apos;ll email you a sign-in link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          autoFocus
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-stone-900 text-white text-sm font-medium py-3 hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      <p className="text-center text-xs text-stone-400">
        Already have an account? Same flow — enter your email and click the link.
      </p>

      <p className="text-center text-xs text-stone-400">
        <Link href="/" className="underline hover:text-stone-600">
          Back to map
        </Link>
      </p>
    </main>
  );
}
