"use client";

import Link from "next/link";
import { buildBlogPostPublicPath } from "@/lib/blog/posts";
import { useEditMode } from "@/lib/editor/EditModeContext";
import { useSiteContext } from "@/lib/editor/SiteContext";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useSectionSettings } from "@/lib/traits/context";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";
import BlogCard from "./BlogCard";

export { blogListSchema } from "./schema";
export type { BlogListProps } from "./schema";

const GRID_COLS_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 @sm:grid-cols-2",
  3: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3",
};

const GAP_CLASSES: Record<string, string> = {
  sm: "gap-4",
  md: "gap-4 @md:gap-6",
  lg: "gap-4 @md:gap-6 @lg:gap-10",
};

export default function BlogList() {
  const { isEditing } = useEditMode();
  const { websiteSlug, websiteId } = useSiteContext();
  const { data } = useSectionData();
  const settings = useSectionSettings();
  const posts = (data.posts as BlogPostDisplayItem[] | undefined) ?? [];
  const columns = Number(settings.columns ?? 3);
  const colsClass = GRID_COLS_CLASSES[columns] ?? GRID_COLS_CLASSES[3];
  const gapClass = GAP_CLASSES[String(settings.gap ?? "md")] ?? GAP_CLASSES.md;
  const blogHref = websiteId ? `/dashboard/sites/${websiteId}/blog` : undefined;

  return (
    <SectionShell>
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="mb-10 flex justify-center @sm:mb-14">
          <SectionHeader align="center" eyebrowFallback="Blog" />
        </div>

        {isEditing ? (
          <div className="blog-section-manage-banner">
            <p>
              Blog posts are managed from the Blog page in your site dashboard. Cards here update
              automatically when you save a post.
            </p>
            {blogHref ? (
              <Link href={blogHref} target="_blank" rel="noopener noreferrer" className="dash-btn dash-btn--orange">
                Manage blog posts
              </Link>
            ) : null}
          </div>
        ) : null}

        {!isEditing && posts.length === 0 ? (
          <p className="list-section-empty">No blog posts published yet.</p>
        ) : null}

        {isEditing && posts.length === 0 ? (
          <p className="list-section-empty">No blog posts yet — add one from the Blog page.</p>
        ) : null}

        <div className={`grid ${colsClass} ${gapClass}`}>
          {posts.map((post, index) => {
            const href =
              websiteSlug && post.slug
                ? buildBlogPostPublicPath(websiteSlug, post.slug)
                : undefined;

            return (
              <SectionDataProvider
                key={post.id ?? `blog-${index}`}
                data={post as unknown as Record<string, unknown>}
                updateField={() => {}}
                updateFields={() => {}}
              >
                <BlogCard post={post} href={href} interactive={!isEditing} />
              </SectionDataProvider>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
