"use client";

import { useEffect, useState } from "react";
import { uploadImageFile } from "@/lib/image-upload";
import { normalizePageSlug, validatePageSlug } from "@/lib/page-slugs";
import { useBuilderStore } from "@/store/builderStore";

export default function SiteSettingsPanel() {
  const site = useBuilderStore((state) => state.site);
  const siteMeta = useBuilderStore((state) => state.site.meta);
  const activePageId = useBuilderStore((state) => state.activePageId);
  const pages = useBuilderStore((state) => state.site.pages);
  const updateSiteMeta = useBuilderStore((state) => state.updateSiteMeta);
  const updatePageMeta = useBuilderStore((state) => state.updatePageMeta);
  const importDraft = useBuilderStore((state) => state.importDraft);
  const tab = useBuilderStore((state) => state.settingsPanelTab);
  const setTab = useBuilderStore((state) => state.setSettingsPanelTab);

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];

  const [slugError, setSlugError] = useState<string | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [faviconError, setFaviconError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<unknown>(null);

  useEffect(() => {
    setSlugError(null);
  }, [activePageId]);

  const handleSlugChange = (value: string) => {
    if (!activePage) {
      return;
    }

    const normalizedSlug = normalizePageSlug(value);
    const validationError = validatePageSlug(
      normalizedSlug,
      pages.map((page) => page.slug),
      activePage.slug,
    );

    if (validationError) {
      setSlugError(validationError);
      return;
    }

    setSlugError(null);
    const submitError = updatePageMeta(activePage.id, { slug: normalizedSlug });
    if (submitError) {
      setSlugError(submitError);
    }
  };

  const handleFaviconUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setFaviconUploading(true);
    setFaviconError(null);
    try {
      const url = await uploadImageFile(file);
      updateSiteMeta({ favicon: url });
    } catch (error) {
      setFaviconError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleExportDraft = () => {
    const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const slug = site.meta.name.trim().toLowerCase().replace(/\s+/g, "-") || "site";
    anchor.href = url;
    anchor.download = `${slug}-draft.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setImportError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      setPendingImport(parsed);
      setImportConfirmOpen(true);
    } catch {
      setImportError("Could not read the JSON file.");
    }
  };

  const confirmImport = () => {
    if (pendingImport === null) {
      return;
    }

    const error = importDraft(pendingImport);
    if (error) {
      setImportError(error);
    } else {
      setImportError(null);
    }

    setImportConfirmOpen(false);
    setPendingImport(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
        <p className="text-xs text-gray-500">Site and page metadata</p>
      </div>
      <div className="style-subtabs" role="tablist" aria-label="Settings categories">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "site"}
          className={`style-subtab${tab === "site" ? " style-subtab--active" : ""}`}
          onClick={() => setTab("site")}
        >
          Site
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "page"}
          className={`style-subtab${tab === "page" ? " style-subtab--active" : ""}`}
          onClick={() => setTab("page")}
        >
          Page
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "data"}
          className={`style-subtab${tab === "data" ? " style-subtab--active" : ""}`}
          onClick={() => setTab("data")}
        >
          Data
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {tab === "site" ? (
          <>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Site name
              </span>
              <input
                type="text"
                className="settings-field"
                value={siteMeta.name}
                onChange={(event) => updateSiteMeta({ name: event.target.value })}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                SEO title
              </span>
              <input
                type="text"
                className="settings-field"
                value={siteMeta.seo.title}
                onChange={(event) =>
                  updateSiteMeta({ seo: { ...siteMeta.seo, title: event.target.value } })
                }
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                SEO description
              </span>
              <textarea
                className="settings-field min-h-[5rem] resize-y"
                value={siteMeta.seo.description}
                onChange={(event) =>
                  updateSiteMeta({ seo: { ...siteMeta.seo, description: event.target.value } })
                }
              />
            </label>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Favicon
              </span>
              {siteMeta.favicon ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteMeta.favicon}
                    alt=""
                    className="h-8 w-8 rounded border border-gray-200 object-contain"
                  />
                  <button
                    type="button"
                    className="text-xs text-gray-600 underline-offset-2 hover:underline"
                    onClick={() => updateSiteMeta({ favicon: undefined })}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs text-gray-600"
                disabled={faviconUploading}
                onChange={(event) => void handleFaviconUpload(event.target.files?.[0])}
              />
              {faviconUploading ? (
                <p className="text-xs text-gray-500">Uploading…</p>
              ) : null}
              {faviconError ? <p className="text-xs text-red-600">{faviconError}</p> : null}
            </div>
          </>
        ) : tab === "data" ? (
          <>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Export draft
              </span>
              <p className="text-xs text-gray-500">
                Download the current draft as JSON for backup or migration.
              </p>
              <button type="button" className="builder-save-btn" onClick={handleExportDraft}>
                Download draft JSON
              </button>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Import draft
              </span>
              <p className="text-xs text-gray-500">
                Replace the current draft with a JSON file. This does not publish automatically.
              </p>
              <input
                type="file"
                accept="application/json,.json"
                className="block w-full text-xs text-gray-600"
                onChange={(event) => void handleImportFile(event.target.files?.[0])}
              />
              {importError ? <p className="text-xs text-red-600">{importError}</p> : null}
            </div>
          </>
        ) : activePage ? (
          <>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Page title
              </span>
              <input
                type="text"
                className="settings-field"
                value={activePage.title}
                onChange={(event) =>
                  updatePageMeta(activePage.id, { title: event.target.value })
                }
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Slug
              </span>
              <input
                type="text"
                className="settings-field"
                value={activePage.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
              />
              {slugError ? <p className="text-xs text-red-600">{slugError}</p> : null}
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                SEO title
              </span>
              <input
                type="text"
                className="settings-field"
                value={activePage.seo?.title ?? ""}
                onChange={(event) =>
                  updatePageMeta(activePage.id, {
                    seo: { ...activePage.seo, title: event.target.value },
                  })
                }
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                SEO description
              </span>
              <textarea
                className="settings-field min-h-[5rem] resize-y"
                value={activePage.seo?.description ?? ""}
                onChange={(event) =>
                  updatePageMeta(activePage.id, {
                    seo: { ...activePage.seo, description: event.target.value },
                  })
                }
              />
            </label>
          </>
        ) : (
          <p className="text-sm text-gray-500">No page selected.</p>
        )}
      </div>

      {importConfirmOpen ? (
        <div className="new-page-dialog-backdrop" onClick={() => setImportConfirmOpen(false)}>
          <div
            className="new-page-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-draft-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="import-draft-title" className="text-sm font-semibold text-gray-900">
              Replace draft?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This will replace your current draft with the imported JSON. Unsaved work in the
              builder will be lost.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="editor-popover-btn"
                onClick={() => {
                  setImportConfirmOpen(false);
                  setPendingImport(null);
                }}
              >
                Cancel
              </button>
              <button type="button" className="builder-save-btn" onClick={confirmImport}>
                Import draft
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
