import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findBlogPostBySlug } from "@/lib/blog/posts";
import { BlogPostSiteRenderer, SiteRenderer } from "@/lib/renderer";
import type { PageData, WebsiteData } from "@/lib/types";
import { getPublishedWebsiteDataBySlug } from "@/lib/website-store";

function resolveSlug(slug?: string[]): string {
  return `/${(slug ?? []).join("/")}`.replace(/\/+$/, "") || "/";
}

function findPage(site: WebsiteData, requestedSlug: string): PageData | undefined {
  return site.pages.find((entry) => entry.slug === requestedSlug);
}

function getBlogPostSlug(slug?: string[]): string | null {
  if (slug?.[0] === "blog" && slug.length === 2 && slug[1]) {
    return slug[1];
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { websiteSlug: string; slug?: string[] };
}): Promise<Metadata> {
  const site = await getPublishedWebsiteDataBySlug(params.websiteSlug);
  if (!site) {
    return { title: "Site not found" };
  }

  const blogPostSlug = getBlogPostSlug(params.slug);
  if (blogPostSlug) {
    const post = findBlogPostBySlug(site, blogPostSlug);
    if (!post) {
      return { title: site.meta.seo.title };
    }

    return {
      title: post.title,
      description: post.excerpt ?? site.meta.seo.description,
    };
  }

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

export default async function PublicWebsitePage({
  params,
}: {
  params: { websiteSlug: string; slug?: string[] };
}) {
  const site = await getPublishedWebsiteDataBySlug(params.websiteSlug);
  if (!site) {
    notFound();
  }

  const blogPostSlug = getBlogPostSlug(params.slug);
  if (blogPostSlug) {
    const post = findBlogPostBySlug(site, blogPostSlug);
    if (!post) {
      notFound();
    }

    const blogPage = site.pages.find((entry) => entry.slug === "/blog");
    const backHref = blogPage
      ? `/w/${params.websiteSlug}/blog`
      : `/w/${params.websiteSlug}`;

    return (
      <BlogPostSiteRenderer
        site={site}
        post={post}
        websiteSlug={params.websiteSlug}
        backHref={backHref}
      />
    );
  }

  const requestedSlug = resolveSlug(params.slug);
  const page = findPage(site, requestedSlug);

  if (!page) {
    notFound();
  }

  return <SiteRenderer site={site} page={page} websiteSlug={params.websiteSlug} />;
}
