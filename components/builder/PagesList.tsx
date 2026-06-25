"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { normalizePageSlug, titleToSlug } from "@/lib/page-slugs";
import { useBuilderStore } from "@/store/builderStore";
import NewPageDialog from "./NewPageDialog";

export default function PagesList() {
  const site = useBuilderStore((state) => state.site);
  const activePageId = useBuilderStore((state) => state.activePageId);
  const setActivePage = useBuilderStore((state) => state.setActivePage);
  const removePage = useBuilderStore((state) => state.removePage);
  const updatePageMeta = useBuilderStore((state) => state.updatePageMeta);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const editingPage = editingPageId
    ? site.pages.find((page) => page.id === editingPageId)
    : null;

  return (
    <>
      <div className="pages-list border-b border-gray-200 px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pages</h4>
        </div>
        <div className="space-y-1">
          {site.pages.map((page) => (
            <div
              key={page.id}
              className={`pages-list__item ${page.id === activePageId ? "pages-list__item--active" : ""}`}
            >
              <button
                type="button"
                className="pages-list__select"
                onClick={() => setActivePage(page.id)}
              >
                <span className="block truncate text-sm font-medium">{page.title}</span>
                <span className="block truncate text-xs text-gray-500">{page.slug}</span>
              </button>
              <div className="pages-list__actions">
                <button
                  type="button"
                  className="pages-list__icon-btn"
                  aria-label={`Rename ${page.title}`}
                  onClick={() => setEditingPageId(page.id)}
                >
                  <Pencil size={13} strokeWidth={1.75} aria-hidden />
                </button>
                {site.pages.length > 1 ? (
                  <button
                    type="button"
                    className="pages-list__icon-btn pages-list__icon-btn--danger"
                    aria-label={`Delete ${page.title}`}
                    onClick={() => removePage(page.id)}
                  >
                    <Trash2 size={13} strokeWidth={1.75} aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="add-page-btn mt-2 w-full"
          onClick={() => setDialogOpen(true)}
        >
          + New Page
        </button>
      </div>

      <NewPageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      {editingPage ? (
        <NewPageDialog
          open
          mode="edit"
          initialTitle={editingPage.title}
          initialSlug={editingPage.slug}
          onClose={() => setEditingPageId(null)}
          onSubmit={(title, slug) => {
            const error = updatePageMeta(editingPage.id, { title, slug });
            if (!error) {
              setEditingPageId(null);
            }
            return error;
          }}
        />
      ) : null}
    </>
  );
}
