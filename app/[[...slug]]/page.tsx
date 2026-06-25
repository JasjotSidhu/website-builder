import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedSiteData } from "@/lib/site-store";
import { SiteRenderer } from "@/lib/renderer";
import type { PageData, WebsiteData } from "@/lib/types";

function resolveSlug(slug?: string[]): string {
  return `/${(slug ?? []).join("/")}`.replace(/\/+$/, "") || "/";
}

function findPage(site: WebsiteData, requestedSlug: string): PageData | undefined {
  return site.pages.find((entry) => entry.slug === requestedSlug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const site = await getPublishedSiteData();
  const requestedSlug = resolveSlug(params.slug);
  const page = findPage(site, requestedSlug);

  if (!page) {
    return { title: site.meta.seo.title };
  }

  const title = page.seo?.title ?? page.title ?? site.meta.seo.title;
  const description = page.seo?.description ?? site.meta.seo.description;

  const metadata: Metadata = {
    title,
    description,
  };

  if (site.meta.favicon) {
    metadata.icons = { icon: site.meta.favicon };
  }

  return metadata;
}

export default async function PublicPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const site = await getPublishedSiteData();
  const requestedSlug = resolveSlug(params.slug);
  const page = findPage(site, requestedSlug);

  if (!page) {
    notFound();
  }

  return <SiteRenderer site={site} page={page} />;
}
