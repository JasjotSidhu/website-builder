"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Star } from "lucide-react";
import { prepareBlogPostForSave } from "@/lib/blog/posts";
import { collectionItemToBlogPost, slugifyBlogTitle } from "@/lib/collections/blog";
import { DEFAULT_BLOG_COLLECTION_ID } from "@/lib/collections/types";
import type { BlogCollectionItem } from "@/lib/collections/types";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";
import { uploadImageFile } from "@/lib/image-upload";
import type { WebsiteData } from "@/lib/types";
import BlogCard from "@/components/sections/blog/BlogCard";
import BlogPostEditor from "./BlogPostEditor";

interface SiteBlogManagerProps {
  websiteId: string;
}

function emptyDraft(): BlogPostDisplayItem {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    author: "",
    publishedAt: today,
  };
}

export default function SiteBlogManager({ websiteId }: SiteBlogManagerProps) {
  const [site, setSite] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<BlogPostDisplayItem>(emptyDraft);
  const [uploadingCover, setUploadingCover] = useState(false);

  const loadSite = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}`);
      if (!res.ok) {
        throw new Error("Failed to load site data");
      }
      const payload = (await res.json()) as { site: WebsiteData };
      setSite(payload.site);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load site data");
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    void loadSite();
  }, [loadSite]);

  const posts = useMemo(() => {
    const collection = site?.collections?.[DEFAULT_BLOG_COLLECTION_ID];
    if (!collection || collection.type !== "blog") {
      return [] as BlogPostDisplayItem[];
    }
    return [...(collection.items as BlogCollectionItem[])]
      .sort((a, b) => {
        const aTime = Date.parse(a.publishedAt ?? a.updatedAt);
        const bTime = Date.parse(b.publishedAt ?? b.updatedAt);
        return bTime - aTime;
      })
      .map(collectionItemToBlogPost);
  }, [site]);

  const openNewPost = () => {
    setIsNew(true);
    setDraft(emptyDraft());
    setEditorOpen(true);
    setMessage(null);
    setError(null);
  };

  const openEditPost = (post: BlogPostDisplayItem) => {
    setIsNew(false);
    setDraft({ ...post });
    setEditorOpen(true);
    setMessage(null);
    setError(null);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setIsNew(false);
    setDraft(emptyDraft());
  };

  const updateDraft = (partial: Partial<BlogPostDisplayItem>) => {
    setDraft((current) => {
      const next = { ...current, ...partial };
      if (partial.title && (!current.slug || current.slug === slugifyBlogTitle(current.title))) {
        next.slug = slugifyBlogTitle(partial.title);
      }
      return next;
    });
  };

  const persistBlogItems = async (items: BlogCollectionItem[], successMessage: string) => {
    if (!site) {
      return false;
    }

    const collection = site.collections?.[DEFAULT_BLOG_COLLECTION_ID];
    const now = new Date().toISOString();
    const nextSite: WebsiteData = {
      ...site,
      collections: {
        ...site.collections,
        [DEFAULT_BLOG_COLLECTION_ID]: {
          id: DEFAULT_BLOG_COLLECTION_ID,
          type: "blog",
          name: "Blog",
          items,
          createdAt: collection?.createdAt ?? now,
          updatedAt: now,
        },
      },
    };

    const res = await fetch(`/api/websites/${websiteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSite),
    });

    if (!res.ok) {
      throw new Error("Failed to save blog posts");
    }

    setSite(nextSite);
    setMessage(successMessage);
    return true;
  };

  const savePost = async () => {
    if (!site) {
      return;
    }

    const title = draft.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const collection = site.collections?.[DEFAULT_BLOG_COLLECTION_ID];
      const existingItems =
        collection?.type === "blog" ? (collection.items as BlogCollectionItem[]) : [];
      const existing = existingItems.find((item) => item.id === draft.id);

      const savedItem = prepareBlogPostForSave(draft, existing);
      let nextItems = isNew
        ? [savedItem, ...existingItems.map((item, index) => ({ ...item, order: index + 1 }))]
        : existingItems.map((item) => (item.id === savedItem.id ? savedItem : item));

      await persistBlogItems(
        nextItems,
        "Blog post saved. Publish your site from the builder to make it live.",
      );
      setEditorOpen(false);
      setIsNew(false);
      setDraft(emptyDraft());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!site || !draft.id || !window.confirm("Delete this blog post?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const collection = site.collections?.[DEFAULT_BLOG_COLLECTION_ID];
      const existingItems =
        collection?.type === "blog" ? (collection.items as BlogCollectionItem[]) : [];
      const nextItems = existingItems
        .filter((item) => item.id !== draft.id)
        .map((item, index) => ({ ...item, order: index }));

      await persistBlogItems(nextItems, "Blog post deleted.");
      closeEditor();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete blog post");
    } finally {
      setSaving(false);
    }
  };

  const setFeaturedPost = async (postId: string) => {
    if (!site) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const collection = site.collections?.[DEFAULT_BLOG_COLLECTION_ID];
      const existingItems =
        collection?.type === "blog" ? (collection.items as BlogCollectionItem[]) : [];
      const target = existingItems.find((item) => item.id === postId);
      if (!target) {
        return;
      }

      const isFeatured = !target.featured;

      const nextItems = existingItems.map((item) =>
        item.id === postId
          ? { ...item, featured: isFeatured, updatedAt: new Date().toISOString() }
          : item,
      );

      await persistBlogItems(
        nextItems,
        isFeatured
          ? `"${target.title}" marked as featured.`
          : `"${target.title}" removed from featured.`,
      );
    } catch (featuredError) {
      setError(
        featuredError instanceof Error ? featuredError.message : "Failed to update featured post",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      updateDraft({ coverImage: url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="site-blog">
        <p className="site-blog__loading">Loading blog posts…</p>
      </div>
    );
  }

  if (editorOpen) {
    return (
      <div className="site-blog">
        {error ? <p className="site-blog__error">{error}</p> : null}
        <BlogPostEditor
          draft={draft}
          isNew={isNew}
          saving={saving}
          uploadingCover={uploadingCover}
          onBack={closeEditor}
          onChange={updateDraft}
          onSave={() => void savePost()}
          onDelete={!isNew && draft.id ? () => void deletePost() : undefined}
          onCoverUpload={(file) => void handleCoverUpload(file)}
        />
      </div>
    );
  }

  return (
    <div className="site-blog">
      <div className="site-blog__header">
        <div>
          <h1 className="site-blog__title">Blog</h1>
          <p className="site-blog__subtitle">
            Posts appear as cards on your site. Publish from the builder to make changes live.
          </p>
        </div>
        <div className="site-manage__actions">
          <a
            href={`/dashboard/sites/${websiteId}/builder`}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn dash-btn--outline site-manage__action-btn"
          >
            <Pencil size={16} strokeWidth={1.75} aria-hidden />
            Edit website
          </a>
          <button
            type="button"
            className="dash-btn dash-btn--orange site-manage__action-btn"
            onClick={openNewPost}
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Create post
          </button>
        </div>
      </div>

      {error ? <p className="site-blog__error">{error}</p> : null}
      {message ? <p className="site-blog__message">{message}</p> : null}

      {posts.length === 0 ? (
        <div className="site-blog__empty">
          <p>No posts yet. Create your first blog post to get started.</p>
          <button type="button" className="dash-btn dash-btn--orange site-manage__action-btn" onClick={openNewPost}>
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Create post
          </button>
        </div>
      ) : (
        <div className="site-blog__grid">
          {posts.map((post) => (
            <div key={post.id} className="site-blog__card-wrap">
              <button
                type="button"
                className="site-blog__card-btn"
                onClick={() => openEditPost(post)}
              >
                <BlogCard post={post} interactive={false} showFeaturedBadge />
              </button>
              <button
                type="button"
                className={`site-blog__featured-btn${post.featured ? " site-blog__featured-btn--active" : ""}`}
                title={post.featured ? "Remove from featured" : "Add to featured"}
                aria-label={post.featured ? "Remove from featured" : "Add to featured"}
                disabled={saving}
                onClick={(event) => {
                  event.stopPropagation();
                  if (post.id) {
                    void setFeaturedPost(post.id);
                  }
                }}
              >
                <Star size={18} strokeWidth={1.75} fill={post.featured ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
