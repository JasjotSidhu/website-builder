import { collectionItemToBlogPost, slugifyBlogTitle } from "@/lib/collections/blog";
import { DEFAULT_BLOG_COLLECTION_ID } from "@/lib/collections/types";
import type { BlogCollectionItem } from "@/lib/collections/types";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";
import type { WebsiteData } from "@/lib/types";
import { sanitizeBlogHtml } from "@/lib/blog/html";

export type BlogDisplayMode = "featured" | "all" | "limit";

export function getBlogCollection(site: WebsiteData) {
  const collection = site.collections?.[DEFAULT_BLOG_COLLECTION_ID];
  return collection?.type === "blog" ? collection : null;
}

export function getBlogPostsFromCollection(site: WebsiteData): BlogPostDisplayItem[] {
  const collection = getBlogCollection(site);
  if (!collection) {
    return [];
  }

  return (collection.items as BlogCollectionItem[])
    .slice()
    .sort((a, b) => {
      const aTime = Date.parse(a.publishedAt ?? a.updatedAt);
      const bTime = Date.parse(b.publishedAt ?? b.updatedAt);
      return bTime - aTime;
    })
    .map(collectionItemToBlogPost);
}

export function findBlogPostBySlug(site: WebsiteData, slug: string): BlogPostDisplayItem | null {
  const collection = getBlogCollection(site);
  if (!collection) {
    return null;
  }

  const item = (collection.items as BlogCollectionItem[]).find((entry) => entry.slug === slug);
  return item ? collectionItemToBlogPost(item) : null;
}

export function filterBlogPostsForDisplay(
  posts: BlogPostDisplayItem[],
  displayMode: BlogDisplayMode,
  options: { postLimit?: number } = {},
): BlogPostDisplayItem[] {
  if (displayMode === "featured") {
    const featured = posts.filter((post) => post.featured);
    return featured.length > 0 ? featured : posts.slice(0, 1);
  }

  if (displayMode === "limit") {
    const limit = Math.max(1, Number(options.postLimit) || 3);
    return posts.slice(0, limit);
  }

  return posts;
}

export function buildBlogPostPublicPath(websiteSlug: string, postSlug: string): string {
  return `/w/${websiteSlug}/blog/${postSlug}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromHtml(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function ensureBlogPostExcerpt(post: BlogPostDisplayItem): string {
  if (post.excerpt?.trim()) {
    return post.excerpt.trim();
  }
  return excerptFromHtml(post.body ?? "");
}

export function prepareBlogPostForSave(
  post: BlogPostDisplayItem,
  existing?: BlogCollectionItem,
): BlogCollectionItem {
  const now = new Date().toISOString();
  const title = post.title.trim() || "Untitled post";
  const body = sanitizeBlogHtml(post.body ?? "");
  const excerpt = post.excerpt?.trim() || excerptFromHtml(body);

  return {
    id: existing?.id ?? post.id ?? `blog-${crypto.randomUUID()}`,
    order: existing?.order ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    slug: post.slug?.trim() || existing?.slug || slugifyBlogTitle(title),
    title,
    excerpt,
    body,
    coverImage: post.coverImage,
    author: post.author,
    publishedAt: post.publishedAt ?? existing?.publishedAt ?? now.slice(0, 10),
    featured: post.featured ?? existing?.featured,
    tags: existing?.tags,
    seo: existing?.seo,
  };
}
