import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getOwnedWebsite } from "@/lib/website-store";

const BuilderLayout = dynamic(() => import("@/components/builder/BuilderLayout"), {
  ssr: false,
  loading: () => (
    <div className="builder-route">
      <div className="builder-shell flex h-screen items-center justify-center text-sm text-gray-500">
        Loading builder…
      </div>
    </div>
  ),
});

interface BuilderPageProps {
  params: { websiteId: string };
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/dashboard/sites/${params.websiteId}/builder`);
  }

  try {
    await getOwnedWebsite(user.id, params.websiteId);
  } catch {
    notFound();
  }

  return <BuilderLayout websiteId={params.websiteId} />;
}
