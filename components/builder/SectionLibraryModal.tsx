"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Tooltip from "@/lib/editor/Tooltip";
import { sectionRegistry } from "@/lib/registry";
import { getAddableSectionDefinitions, isFixedSlotType } from "@/lib/section-placement";
import { useBuilderStore } from "@/store/builderStore";
import SavedSectionPreview from "./SavedSectionPreview";
import SectionVariantPreview from "./SectionVariantPreview";
import type { SectionLibraryMode } from "./SectionLibraryModal.types";

export type { SectionLibraryMode } from "./SectionLibraryModal.types";

interface SectionLibraryModalProps {
  open: boolean;
  config: SectionLibraryMode | null;
  onClose: () => void;
}

const SAVED_SECTIONS_TYPE = "__saved__";

const CATEGORY_ICONS: Record<string, string> = {
  header: "⬡",
  hero: "◆",
  content: "▦",
  "social-proof": "★",
  cta: "→",
  footer: "▬",
  saved: "★",
};

type VariantSelection = { type: string; variantId: string };
type SavedSelection = { savedId: string };
type LibrarySelection = VariantSelection | SavedSelection;

function isSavedSelection(selection: LibrarySelection): selection is SavedSelection {
  return "savedId" in selection;
}

function getSidebarTypes(config: SectionLibraryMode) {
  if (config.mode === "replace-header") {
    return [sectionRegistry.header];
  }

  if (config.mode === "replace-footer") {
    return [sectionRegistry.footer];
  }

  if (config.mode === "replace") {
    const def = sectionRegistry[config.sectionType];
    return def && !isFixedSlotType(config.sectionType) ? [def] : [];
  }

  return getAddableSectionDefinitions();
}

function getDefaultActiveType(config: SectionLibraryMode) {
  if (config.mode === "replace-header") {
    return "header";
  }

  if (config.mode === "replace-footer") {
    return "footer";
  }

  if (config.mode === "replace") {
    return config.sectionType;
  }

  return getAddableSectionDefinitions()[0]?.type ?? "hero";
}

export default function SectionLibraryModal({
  open,
  config,
  onClose,
}: SectionLibraryModalProps) {
  const theme = useBuilderStore((state) => state.site.theme);
  const savedSections = useBuilderStore((state) => state.site.savedSections ?? []);
  const sidebarTypes = config ? getSidebarTypes(config) : [];
  const isReplace =
    config?.mode === "replace" ||
    config?.mode === "replace-header" ||
    config?.mode === "replace-footer";
  const isAddMode = config?.mode === "add";

  const [activeType, setActiveType] = useState("hero");
  const [selected, setSelected] = useState<LibrarySelection | null>(null);

  const addSection = useBuilderStore((state) => state.addSection);
  const addSavedSection = useBuilderStore((state) => state.addSavedSection);
  const removeSavedSection = useBuilderStore((state) => state.removeSavedSection);
  const replaceSection = useBuilderStore((state) => state.replaceSection);
  const replaceHeaderVariant = useBuilderStore((state) => state.replaceHeaderVariant);
  const replaceFooterVariant = useBuilderStore((state) => state.replaceFooterVariant);

  useEffect(() => {
    if (!open || !config) {
      return;
    }

    const defaultType = getDefaultActiveType(config);
    setActiveType(defaultType);

    if (config.mode === "replace") {
      setSelected({ type: config.sectionType, variantId: config.currentVariantId });
    } else if (config.mode === "replace-header") {
      setSelected({ type: "header", variantId: config.currentVariantId });
    } else if (config.mode === "replace-footer") {
      setSelected({ type: "footer", variantId: config.currentVariantId });
    } else {
      setSelected(null);
    }
  }, [open, config]);

  const activeDef =
    activeType === SAVED_SECTIONS_TYPE ? null : sectionRegistry[activeType];
  const viewingSaved = isAddMode && activeType === SAVED_SECTIONS_TYPE;

  if (!open || !config) {
    return null;
  }

  if (!viewingSaved && !activeDef) {
    return null;
  }

  const handleSave = () => {
    if (!selected) {
      return;
    }

    if (config.mode === "replace-header" && !isSavedSelection(selected)) {
      replaceHeaderVariant(selected.variantId);
    } else if (config.mode === "replace-footer" && !isSavedSelection(selected)) {
      replaceFooterVariant(selected.variantId);
    } else if (config.mode === "replace" && !isSavedSelection(selected)) {
      replaceSection(config.sectionId, selected.type, selected.variantId);
    } else if (config.mode === "add" && isSavedSelection(selected)) {
      addSavedSection(selected.savedId, config.insertAtIndex);
    } else if (config.mode === "add" && !isSavedSelection(selected)) {
      addSection(selected.type, selected.variantId, config.insertAtIndex);
    }

    onClose();
  };

  const typeLabel = viewingSaved
    ? "Saved sections"
    : sectionRegistry[activeType]?.label;
  const modalTitle =
    config.mode === "replace-header"
      ? "Replace header"
      : config.mode === "replace-footer"
        ? "Replace footer"
        : config.mode === "replace"
          ? "Replace section"
          : "Section library";

  const modalSubtitle =
    config.mode === "replace-header"
      ? "Choose a header layout. The header always stays at the top of your page."
      : config.mode === "replace-footer"
        ? "Choose a footer layout. The footer always stays at the bottom of your page."
        : config.mode === "replace"
          ? `Choose a new ${typeLabel?.toLowerCase() ?? "section"} layout. Your content stays — only the design changes.`
          : "Browse layouts with live previews, or reuse a section you saved earlier.";

  const isCurrentSelection =
    (config.mode === "replace" &&
      selected &&
      !isSavedSelection(selected) &&
      selected.variantId === config.currentVariantId &&
      selected.type === config.sectionType) ||
    (config.mode === "replace-header" &&
      selected &&
      !isSavedSelection(selected) &&
      selected.variantId === config.currentVariantId) ||
    (config.mode === "replace-footer" &&
      selected &&
      !isSavedSelection(selected) &&
      selected.variantId === config.currentVariantId);

  return (
    <div className="section-library-modal">
      <button
        type="button"
        className="section-library-backdrop"
        aria-label="Close section library"
        onClick={onClose}
      />
      <div className="section-library-panel" role="dialog" aria-modal="true">
        <div className="section-library-header">
          <div>
            <h2 className="section-library-title">{modalTitle}</h2>
            <p className="section-library-subtitle">{modalSubtitle}</p>
          </div>
          <Tooltip label="Close" side="left">
            <button
              type="button"
              className="section-library-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          </Tooltip>
        </div>

        <div
          className={`section-library-body ${
            isReplace || sidebarTypes.length <= 1 ? "section-library-body--replace" : ""
          }`}
        >
          {!isReplace && sidebarTypes.length > 1 ? (
            <aside className="section-library-sidebar">
              <p className="section-library-sidebar-label">Categories</p>
              {isAddMode ? (
                <button
                  type="button"
                  className={`section-library-category ${
                    viewingSaved ? "section-library-category--active" : ""
                  }`}
                  onClick={() => {
                    setActiveType(SAVED_SECTIONS_TYPE);
                    setSelected(null);
                  }}
                >
                  <span className="section-library-category-icon" aria-hidden>
                    {CATEGORY_ICONS.saved}
                  </span>
                  <span>
                    <span className="section-library-category-name">Saved</span>
                    <span className="section-library-category-count">
                      {savedSections.length} saved
                    </span>
                  </span>
                </button>
              ) : null}
              {sidebarTypes.map((def) => (
                <button
                  key={def.type}
                  type="button"
                  className={`section-library-category ${
                    def.type === activeType ? "section-library-category--active" : ""
                  }`}
                  onClick={() => {
                    setActiveType(def.type);
                    setSelected(null);
                  }}
                >
                  <span className="section-library-category-icon" aria-hidden>
                    {CATEGORY_ICONS[def.category] ?? "•"}
                  </span>
                  <span>
                    <span className="section-library-category-name">{def.label}</span>
                    <span className="section-library-category-count">
                      {def.variants.length} layout{def.variants.length === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
              ))}
            </aside>
          ) : null}

          <div className="section-library-grid">
            {viewingSaved ? (
              savedSections.length === 0 ? (
                <div className="section-library-empty">
                  <p className="section-library-empty-title">No saved sections yet</p>
                  <p className="section-library-empty-text">
                    Use the bookmark button on any section toolbar to save it with its content.
                  </p>
                </div>
              ) : (
                savedSections.map((saved) => {
                  const isSelected =
                    selected && isSavedSelection(selected) && selected.savedId === saved.id;
                  const typeLabel = sectionRegistry[saved.type]?.label ?? saved.type;
                  const variantLabel =
                    sectionRegistry[saved.type]?.variants.find(
                      (entry) => entry.id === saved.variant,
                    )?.label ?? saved.variant;

                  return (
                    <div
                      key={saved.id}
                      role="button"
                      tabIndex={0}
                      className={`section-library-card ${
                        isSelected ? "section-library-card--selected" : ""
                      }`}
                      onClick={() => setSelected({ savedId: saved.id })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelected({ savedId: saved.id });
                        }
                      }}
                    >
                      <div className="section-library-card-header">
                        <span className="section-library-card-title">
                          {saved.name}
                          <span className="section-library-card-badge">{typeLabel}</span>
                        </span>
                        {isSelected ? (
                          <span className="section-library-card-check" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <p className="section-library-card-meta">{variantLabel}</p>
                      <div className="section-library-preview">
                        <div className="section-library-preview-scale">
                          <SavedSectionPreview saved={saved} theme={theme} />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="section-library-card-remove"
                        aria-label={`Remove ${saved.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeSavedSection(saved.id);
                          if (
                            selected &&
                            isSavedSelection(selected) &&
                            selected.savedId === saved.id
                          ) {
                            setSelected(null);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )
            ) : (
              activeDef?.variants.map((variant) => {
                const isCurrent =
                  (config.mode === "replace" && variant.id === config.currentVariantId) ||
                  (config.mode === "replace-header" && variant.id === config.currentVariantId) ||
                  (config.mode === "replace-footer" && variant.id === config.currentVariantId);
                const isSelected =
                  selected &&
                  !isSavedSelection(selected) &&
                  selected.variantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    className={`section-library-card ${
                      isSelected ? "section-library-card--selected" : ""
                    } ${isCurrent ? "section-library-card--current" : ""}`}
                    onClick={() =>
                      setSelected({ type: activeType, variantId: variant.id })
                    }
                  >
                    <div className="section-library-card-header">
                      <span className="section-library-card-title">
                        {variant.label}
                        {isCurrent ? (
                          <span className="section-library-card-badge">Current</span>
                        ) : null}
                      </span>
                      {isSelected ? (
                        <span className="section-library-card-check" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </div>
                    <div className="section-library-preview">
                      <div className="section-library-preview-scale">
                        <SectionVariantPreview
                          type={activeType}
                          variant={variant}
                          theme={theme}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="section-library-footer">
          <button type="button" className="editor-popover-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="editor-popover-btn editor-popover-btn--primary"
            disabled={!selected || Boolean(isCurrentSelection)}
            onClick={handleSave}
          >
            {isReplace ? "Replace" : "Add section"}
          </button>
        </div>
      </div>
    </div>
  );
}
