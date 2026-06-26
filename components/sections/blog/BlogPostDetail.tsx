"use client";

import Link from "next/link";
import { ensureBlogPostExcerpt } from "@/lib/blog/posts";
import { sanitizeBlogHtml } from "@/lib/blog/html";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";
import { SectionShell } from "../shared/SectionShell";

function formatDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

export default function BlogPostDetail({
  post,
  backHref,
}: {
  post: BlogPostDisplayItem;
  backHref?: string;
}) {
  const dateLabel = formatDate(post.publishedAt);
  const excerpt = ensureBlogPostExcerpt(post);
  const initial = (post.title ?? "B")[0]?.toUpperCase() ?? "B";

  return (
    <SectionShell>
      <article className="mx-auto max-w-3xl px-4 py-10 @sm:px-6 @lg:px-8">
        {backHref ? (
          <Link href={backHref} className="blog-post-back mb-8 inline-flex text-sm font-medium opacity-70">
            ← Back
          </Link>
        ) : null}

        {post.coverImage ? (
          <div className="blog-post-cover mb-8 overflow-hidden rounded-[var(--card-radius)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="blog-post-cover blog-card__cover-placeholder mb-8 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[var(--card-radius)]">
            <span className="blog-card__cover-initial text-5xl" aria-hidden>
              {initial}
            </span>
          </div>
        )}

        <header className="mb-8">
          {dateLabel || post.author ? (
            <p className="mb-3 text-sm font-medium uppercase tracking-wide opacity-60">
              {[dateLabel, post.author].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight @sm:text-4xl">{post.title}</h1>
          {excerpt ? <p className="mt-4 text-lg leading-relaxed opacity-75">{excerpt}</p> : null}
        </header>

        <div
          className="blog-post-body prose-section"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.body ?? "") }}
        />
      </article>
    </SectionShell>
  );
}
