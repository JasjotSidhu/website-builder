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
      ? "builder-topbar__status--warn"
      : "builder-topbar__status--muted";

  return (
    <header className="builder-topbar flex items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Link href="/dashboard" className="builder-topbar__back shrink-0 text-xs font-medium">
          ← Dashboard
        </Link>
        <span className="builder-topbar__divider hidden h-4 w-px shrink-0 sm:block" aria-hidden />
        <h1 className="builder-topbar__title min-w-0 truncate text-sm font-semibold">{siteName}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1 sm:flex">
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
        <span className={`builder-topbar__status hidden max-w-[11rem] truncate text-xs sm:inline ${statusClass}`} aria-live="polite">
          {statusText}
        </span>
        {websiteSlug ? (
          <a
            href={`/w/${websiteSlug}`}
            target="_blank"
            rel="noreferrer"
            className="builder-topbar__link hidden text-xs font-medium underline-offset-2 hover:underline md:inline"
          >
            View live
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
