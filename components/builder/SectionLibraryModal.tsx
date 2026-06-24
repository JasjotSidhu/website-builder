"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Tooltip from "@/lib/editor/Tooltip";
import { sectionRegistry } from "@/lib/registry";
import { getAddableSectionDefinitions, isFixedSlotType } from "@/lib/section-placement";
import { useBuilderStore } from "@/store/builderStore";
import SectionVariantPreview from "./SectionVariantPreview";
import type { SectionLibraryMode } from "./SectionLibraryModal.types";

export type { SectionLibraryMode } from "./SectionLibraryModal.types";

interface SectionLibraryModalProps {
  open: boolean;
  config: SectionLibraryMode | null;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  header: "⬡",
  hero: "◆",
  content: "▦",
  "social-proof": "★",
  cta: "→",
  footer: "▬",
};

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
  const sidebarTypes = config ? getSidebarTypes(config) : [];
  const isReplace =
    config?.mode === "replace" ||
    config?.mode === "replace-header" ||
    config?.mode === "replace-footer";

  const [activeType, setActiveType] = useState("hero");
  const [selected, setSelected] = useState<{ type: string; variantId: string } | null>(
    null,
  );

  const addSection = useBuilderStore((state) => state.addSection);
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

  const activeDef = sectionRegistry[activeType];

  if (!open || !config || !activeDef) {
    return null;
  }

  const handleSave = () => {
    if (!selected) {
      return;
    }

    if (config.mode === "replace-header") {
      replaceHeaderVariant(selected.variantId);
    } else if (config.mode === "replace-footer") {
      replaceFooterVariant(selected.variantId);
    } else if (config.mode === "replace") {
      replaceSection(config.sectionId, selected.type, selected.variantId);
    } else {
      addSection(selected.type, selected.variantId, config.insertAtIndex);
    }

    onClose();
  };

  const typeLabel = sectionRegistry[activeType]?.label;
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
          : "Browse layouts with live previews. Header and footer are fixed at the top and bottom.";

  const isCurrentSelection =
    (config.mode === "replace" &&
      selected?.variantId === config.currentVariantId &&
      selected?.type === config.sectionType) ||
    (config.mode === "replace-header" && selected?.variantId === config.currentVariantId) ||
    (config.mode === "replace-footer" && selected?.variantId === config.currentVariantId);

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
            {activeDef.variants.map((variant) => {
              const isCurrent =
                (config.mode === "replace" && variant.id === config.currentVariantId) ||
                (config.mode === "replace-header" && variant.id === config.currentVariantId) ||
                (config.mode === "replace-footer" && variant.id === config.currentVariantId);
              const isSelected = selected?.variantId === variant.id;

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
            })}
          </div>
        </div>

        <div className="section-library-footer">
          <button type="button" className="editor-popover-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="editor-popover-btn editor-popover-btn--primary"
            disabled={!selected || isCurrentSelection}
            onClick={handleSave}
          >
            {isReplace ? "Replace" : "Add section"}
          </button>
        </div>
      </div>
    </div>
  );
}
