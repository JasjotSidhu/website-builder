"use client";

import Link from "next/link";
import { Redo2, Undo2 } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";

export default function BuilderTopBar() {
  const siteName = useBuilderStore((state) => state.site.meta.name);
  const websiteSlug = useBuilderStore((state) => state.websiteSlug);
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
    <header className="builder-topbar flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-3 py-3 sm:px-4">
      <div className="min-w-0 flex-1">
        <Link
          href="/dashboard"
          className="mb-1 inline-block text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          ← Dashboard
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">{siteName}</h1>
        <p className="hidden text-xs text-gray-500 sm:block">Page builder — click any text to edit inline</p>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
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
        <span className={`max-w-[11rem] truncate text-xs ${statusClass}`} aria-live="polite">
          {statusText}
        </span>
        {websiteSlug ? (
          <a
            href={`/w/${websiteSlug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline sm:inline"
          >
            View live site
          </a>
        ) : null}
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
