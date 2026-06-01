import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Coming soon</h1>
      <p className="text-stone-500">
        Account creation is being built. Check back soon, or{" "}
        <Link href="/" className="underline hover:text-stone-700">
          browse existing resources
        </Link>{" "}
        in your zip code.
      </p>
    </main>
  );
}
