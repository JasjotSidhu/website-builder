import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Website Builder</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
          Build and publish multi-page sites
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Create websites with a visual section builder, global themes, and one-click publish to your own URL.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
