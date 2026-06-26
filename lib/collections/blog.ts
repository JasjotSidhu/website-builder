import type { BlogCollectionItem } from "./types";

export interface BlogPostDisplayItem {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  featured?: boolean;
}

export function slugifyBlogTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "post";
}

export function collectionItemToBlogPost(item: BlogCollectionItem): BlogPostDisplayItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    body: item.body,
    coverImage: item.coverImage,
    author: item.author,
    publishedAt: item.publishedAt,
    featured: item.featured,
  };
}

export function syncBlogPostsToCollectionItems(
  displayItems: BlogPostDisplayItem[],
  previousItems: BlogCollectionItem[],
): BlogCollectionItem[] {
  const now = new Date().toISOString();

  return displayItems.map((item, index) => {
    const byId = item.id ? previousItems.find((entry) => entry.id === item.id) : undefined;
    const existing = byId ?? previousItems[index];
    const title = item.title.trim() || "Untitled post";

    return {
      id: existing?.id ?? item.id ?? `blog-${crypto.randomUUID()}`,
      order: index,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      slug: item.slug?.trim() || existing?.slug || slugifyBlogTitle(title),
      title,
      excerpt: item.excerpt,
      body: item.body ?? existing?.body ?? "",
      coverImage: item.coverImage,
      author: item.author,
      publishedAt: item.publishedAt ?? existing?.publishedAt,
      featured: item.featured ?? existing?.featured,
      tags: existing?.tags,
      seo: existing?.seo,
    };
  });
}

export function createEmptyBlogPost(order: number): BlogCollectionItem {
  const now = new Date().toISOString();
  const title = "New post";
  return {
    id: `blog-${crypto.randomUUID()}`,
    order,
    createdAt: now,
    updatedAt: now,
    slug: slugifyBlogTitle(title),
    title,
    excerpt: "Short excerpt for this post.",
    body: "",
    author: "Author",
    publishedAt: now.slice(0, 10),
  };
}
