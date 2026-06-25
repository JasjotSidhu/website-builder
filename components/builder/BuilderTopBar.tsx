"use client";

import { Redo2, Undo2 } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";

export default function BuilderTopBar() {
  const siteName = useBuilderStore((state) => state.site.meta.name);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const isSaving = useBuilderStore((state) => state.isSaving);
  const isPublishing = useBuilderStore((state) => state.isPublishing);
  const hasUnpublishedChanges = useBuilderStore((state) => state.hasUnpublishedChanges);
  const saveError = useBuilderStore((state) => state.saveError);
  const historyPast = useBuilderStore((state) => state.historyPast);
  const historyFuture = useBuilderStore((state) => state.historyFuture);
  const saveSite = useBuilderStore((state) => state.saveSite);
  const publishSite = useBuilderStore((state) => state.publishSite);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);

  const statusText = isPublishing
    ? "Publishing…"
    : isSaving
      ? "Saving…"
      : saveError
        ? saveError
        : isDirty
          ? "Unsaved changes"
          : hasUnpublishedChanges
            ? "Unpublished changes"
            : "All changes saved";

  const statusClass = saveError
    ? "text-red-600"
    : isDirty || hasUnpublishedChanges
      ? "text-amber-600"
      : "text-gray-500";

  return (
    <header className="builder-topbar flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">{siteName}</h1>
        <p className="text-xs text-gray-500">Page builder — click any text to edit inline</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="builder-icon-btn"
            disabled={historyPast.length === 0}
            aria-label="Undo"
            title="Undo (⌘Z)"
            onClick={() => undo()}
          >
            <Undo2 size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="builder-icon-btn"
            disabled={historyFuture.length === 0}
            aria-label="Redo"
            title="Redo (⌘⇧Z)"
            onClick={() => redo()}
          >
            <Redo2 size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <span className={`max-w-xs truncate text-xs ${statusClass}`} aria-live="polite">
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
          disabled={!isDirty || isSaving || isPublishing}
          onClick={() => void saveSite()}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="builder-publish-btn"
          disabled={(!hasUnpublishedChanges && !isDirty) || isPublishing || isSaving}
          onClick={() => void publishSite()}
        >
          {isPublishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </header>
  );
}
