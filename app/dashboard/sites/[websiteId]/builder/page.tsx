import { notFound, redirect } from "next/navigation";
import BuilderLayout from "@/components/builder/BuilderLayout";
import { getSessionUser } from "@/lib/auth/session";
import { getOwnedWebsite } from "@/lib/website-store";

interface BuilderPageProps {
  params: { websiteId: string };
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  try {
    await getOwnedWebsite(user.id, params.websiteId);
  } catch {
    notFound();
  }

  return <BuilderLayout websiteId={params.websiteId} />;
}
