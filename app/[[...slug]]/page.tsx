import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site-store";
import { SiteRenderer } from "@/lib/renderer";

export default async function PublicPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const site = await getSiteData();
  const requestedSlug = `/${(params.slug ?? []).join("/")}`.replace(/\/+$/, "") || "/";
  const page = site.pages.find((entry) => entry.slug === requestedSlug);

  if (!page) {
    notFound();
  }

  return <SiteRenderer site={site} page={page} />;
}
