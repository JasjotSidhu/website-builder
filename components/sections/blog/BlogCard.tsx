"use client";

import Link from "next/link";
import { ensureBlogPostExcerpt } from "@/lib/blog/posts";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";

function formatDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

export default function BlogCard({
  post,
  href,
  interactive = true,
  showFeaturedBadge = false,
}: {
  post: BlogPostDisplayItem;
  href?: string;
  interactive?: boolean;
  showFeaturedBadge?: boolean;
}) {
  const dateLabel = formatDate(post.publishedAt);
  const excerpt = ensureBlogPostExcerpt(post);
  const initial = (post.title ?? "B")[0]?.toUpperCase() ?? "B";

  const cover = post.coverImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="blog-card__cover-placeholder flex h-full w-full items-center justify-center">
      <span className="blog-card__cover-initial" aria-hidden>
        {initial}
      </span>
    </div>
  );

  const content = (
    <>
      <div className="blog-card__cover aspect-[16/10] w-full overflow-hidden">
        {showFeaturedBadge && post.featured ? (
          <span className="blog-card__featured-badge">Featured</span>
        ) : null}
        {cover}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {dateLabel || post.author ? (
          <p className="blog-card__meta mb-2 text-xs font-medium uppercase tracking-wide opacity-60">
            {[dateLabel, post.author].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug text-[var(--color-card-title-text)]">
          {post.title}
        </h3>
        {excerpt ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed opacity-75">{excerpt}</p>
        ) : null}
      </div>
    </>
  );

  if (!interactive || !href) {
    return <article className="blog-card flex h-full flex-col overflow-hidden">{content}</article>;
  }

  return (
    <article className="blog-card group flex h-full flex-col overflow-hidden">
      <Link href={href} className="flex h-full flex-col">
        {content}
      </Link>
    </article>
  );
}
