"use client";

import { useEffect, useState } from "react";
import { normalizePageSlug, titleToSlug, validatePageSlug } from "@/lib/page-slugs";
import { useBuilderStore } from "@/store/builderStore";

interface NewPageDialogProps {
  open: boolean;
  mode?: "create" | "edit";
  initialTitle?: string;
  initialSlug?: string;
  onClose: () => void;
  onSubmit?: (title: string, slug: string) => string | null;
}

export default function NewPageDialog({
  open,
  mode = "create",
  initialTitle = "",
  initialSlug = "",
  onClose,
  onSubmit,
}: NewPageDialogProps) {
  const addPage = useBuilderStore((state) => state.addPage);
  const pages = useBuilderStore((state) => state.site.pages);

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setSlug(initialSlug || "/");
      setError(null);
      setSlugTouched(mode === "edit");
    }
  }, [open, initialTitle, initialSlug, mode]);

  if (!open) {
    return null;
  }

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched && mode === "create") {
      setSlug(titleToSlug(value));
    }
  };

  const handleSave = () => {
    const normalizedSlug = normalizePageSlug(slug);
    const validationError = validatePageSlug(
      normalizedSlug,
      pages.map((page) => page.slug),
      mode === "edit" ? initialSlug : undefined,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    if (mode === "edit" && onSubmit) {
      const submitError = onSubmit(title.trim() || "Untitled", normalizedSlug);
      if (submitError) {
        setError(submitError);
        return;
      }
      onClose();
      return;
    }

    const addError = addPage(title.trim() || "New Page", normalizedSlug);
    if (addError) {
      setError(addError);
      return;
    }

    onClose();
  };

  return (
    <div className="new-page-dialog-backdrop" onClick={onClose}>
      <div
        className="new-page-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-page-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="new-page-dialog-title" className="text-sm font-semibold text-gray-900">
          {mode === "edit" ? "Edit page" : "New page"}
        </h3>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Title</span>
            <input
              type="text"
              className="new-page-dialog__input"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="About us"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Slug</span>
            <input
              type="text"
              className="new-page-dialog__input"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="/about"
            />
          </label>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="editor-popover-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="builder-save-btn" onClick={handleSave}>
            {mode === "edit" ? "Save" : "Create page"}
          </button>
        </div>
      </div>
    </div>
  );
}
