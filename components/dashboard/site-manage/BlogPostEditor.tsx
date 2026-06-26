"use client";

import { ArrowLeft, ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import type { BlogPostDisplayItem } from "@/lib/collections/blog";
import BlogRichTextEditor from "./BlogRichTextEditor";

interface BlogPostEditorProps {
  draft: BlogPostDisplayItem;
  isNew: boolean;
  saving: boolean;
  uploadingCover: boolean;
  onBack: () => void;
  onChange: (partial: Partial<BlogPostDisplayItem>) => void;
  onSave: () => void;
  onDelete?: () => void;
  onCoverUpload: (file: File) => void;
}

export default function BlogPostEditor({
  draft,
  isNew,
  saving,
  uploadingCover,
  onBack,
  onChange,
  onSave,
  onDelete,
  onCoverUpload,
}: BlogPostEditorProps) {
  const coverFileRef = useRef<HTMLInputElement>(null);

  const openCoverPicker = () => {
    coverFileRef.current?.click();
  };

  const handleCoverFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    onCoverUpload(file);
    if (coverFileRef.current) {
      coverFileRef.current.value = "";
    }
  };

  return (
    <div className="site-blog__editor">
      <div className="site-blog__editor-top">
        <button type="button" className="site-blog__back-btn" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
          Back to posts
        </button>
        <div className="site-blog__editor-actions">
          <button
            type="button"
            className="dash-btn dash-btn--orange site-manage__action-btn"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="site-blog__editor-layout">
        <div className="site-blog__editor-main">
          <input
            type="text"
            className="blog-editor-medium__title"
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Title"
            aria-label="Post title"
          />

          <BlogRichTextEditor
            variant="medium"
            editorKey={isNew ? "new" : draft.id ?? "draft"}
            value={draft.body ?? ""}
            onChange={(body) => onChange({ body })}
            placeholder="Tell your story…"
          />
        </div>

        <aside className="site-blog__editor-sidebar" aria-label="Post settings">
          <h2 className="site-blog__editor-sidebar-title">Post settings</h2>

          <div className="site-blog__featured-field">
            <label className="site-blog__featured-checkbox">
              <input
                type="checkbox"
                checked={Boolean(draft.featured)}
                onChange={(event) => onChange({ featured: event.target.checked })}
              />
              <span>Featured post</span>
            </label>
            <p className="site-blog__featured-note">
              Featured posts appear in blog sections set to &quot;Featured posts&quot;.
            </p>
          </div>

          <label className="site-manage__field">
            <span>URL slug</span>
            <input
              type="text"
              value={draft.slug ?? ""}
              onChange={(event) => onChange({ slug: event.target.value })}
              placeholder="post-url-slug"
            />
          </label>

          <label className="site-manage__field">
            <span>Author</span>
            <input
              type="text"
              value={draft.author ?? ""}
              onChange={(event) => onChange({ author: event.target.value })}
              placeholder="Author name"
            />
          </label>

          <label className="site-manage__field">
            <span>Published date</span>
            <input
              type="date"
              value={draft.publishedAt ?? ""}
              onChange={(event) => onChange({ publishedAt: event.target.value })}
            />
          </label>

          <div className="site-manage__field">
            <span>Cover image</span>
            <div className="blog-cover-field">
              {draft.coverImage ? (
                <div className="blog-cover-field__preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.coverImage} alt="" />
                </div>
              ) : (
                <button
                  type="button"
                  className="blog-cover-field__dropzone"
                  disabled={uploadingCover}
                  onClick={openCoverPicker}
                >
                  <ImagePlus size={24} strokeWidth={1.5} aria-hidden />
                  <span>{uploadingCover ? "Uploading…" : "Click to upload cover image"}</span>
                  <span className="blog-cover-field__hint">PNG, JPG, or WebP</span>
                </button>
              )}

              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => handleCoverFile(event.target.files?.[0])}
              />

              <input
                type="url"
                className="blog-cover-field__url-input"
                value={draft.coverImage ?? ""}
                onChange={(event) => onChange({ coverImage: event.target.value })}
                placeholder="Or paste image URL"
              />

              <div className="blog-cover-field__actions">
                <button
                  type="button"
                  className="dash-btn dash-btn--ghost blog-cover-field__action-btn"
                  disabled={uploadingCover}
                  onClick={openCoverPicker}
                >
                  <Upload size={16} strokeWidth={1.75} aria-hidden />
                  {uploadingCover ? "Uploading…" : draft.coverImage ? "Replace image" : "Upload image"}
                </button>
                {draft.coverImage ? (
                  <button
                    type="button"
                    className="dash-btn site-blog__delete-btn blog-cover-field__action-btn"
                    disabled={saving}
                    onClick={() => onChange({ coverImage: undefined })}
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                    Remove image
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {!isNew && onDelete ? (
            <div className="site-blog__sidebar-footer">
              <button
                type="button"
                className="dash-btn site-blog__delete-btn site-blog__delete-btn--full"
                disabled={saving}
                onClick={onDelete}
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                Delete post
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
