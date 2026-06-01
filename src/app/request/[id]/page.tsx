import Link from "next/link";

export default function RequestPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Coming soon</h1>
      <p className="text-stone-500">
        The connection request flow is being built.{" "}
        <Link href="/" className="underline hover:text-stone-700">
          Go back home.
        </Link>
      </p>
    </main>
  );
}
