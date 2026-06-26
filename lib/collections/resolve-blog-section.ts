import {
  filterBlogPostsForDisplay,
  getBlogPostsFromCollection,
  type BlogDisplayMode,
} from "@/lib/blog/posts";
import { DEFAULT_BLOG_COLLECTION_ID } from "./types";
import type { SectionInstance, WebsiteData } from "@/lib/types";

export function resolveBlogSectionProps(
  site: WebsiteData,
  section: SectionInstance,
): Record<string, unknown> {
  const posts = getBlogPostsFromCollection(site);
  const displayMode = (section.props.displayMode as BlogDisplayMode | undefined) ?? "limit";
  const postLimit =
    typeof section.props.postLimit === "number" ? section.props.postLimit : Number(section.props.postLimit) || 3;

  return {
    ...section.props,
    dataSource: {
      mode: "collection" as const,
      collectionId: DEFAULT_BLOG_COLLECTION_ID,
      sort: "newest" as const,
    },
    posts: filterBlogPostsForDisplay(posts, displayMode, { postLimit }),
  };
}
