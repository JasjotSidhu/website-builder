"use client";

import { useBuilderStore } from "@/store/builderStore";

export default function BuilderTopBar() {
  const siteName = useBuilderStore((state) => state.site.meta.name);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const isSaving = useBuilderStore((state) => state.isSaving);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const saveSite = useBuilderStore((state) => state.saveSite);

  const statusText = isSaving
    ? "Saving…"
    : isDirty
      ? "Unsaved changes"
      : lastSavedAt
        ? "All changes saved"
        : "All changes saved";

  return (
    <header className="builder-topbar flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">{siteName}</h1>
        <p className="text-xs text-gray-500">Page builder — click any text to edit inline</p>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`text-xs ${isDirty ? "text-amber-600" : "text-gray-500"}`}
          aria-live="polite"
        >
          {statusText}
        </span>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
        >
          View live site
        </a>
        <button
          type="button"
          className="builder-save-btn"
          disabled={!isDirty || isSaving}
          onClick={() => void saveSite()}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </header>
  );
}
