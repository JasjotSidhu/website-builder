"use client";

import { useEffect, useState } from "react";
import { EditModeContext } from "@/lib/editor/EditModeContext";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { sectionRegistry } from "@/lib/registry";
import { useBuilderStore } from "@/store/builderStore";

export type SectionLibraryMode =
  | { mode: "add"; insertAtIndex: number }
  | { mode: "replace"; sectionId: string; sectionType: string; currentVariantId: string };

interface SectionLibraryModalProps {
  open: boolean;
  config: SectionLibraryMode | null;
  onClose: () => void;
}

export default function SectionLibraryModal({
  open,
  config,
  onClose,
}: SectionLibraryModalProps) {
  const allTypes = Object.values(sectionRegistry);
  const isReplace = config?.mode === "replace";
  const sidebarTypes = isReplace
    ? allTypes.filter((def) => def.type === config.sectionType)
    : allTypes;

  const [activeType, setActiveType] = useState(sidebarTypes[0]?.type ?? "hero");
  const [selected, setSelected] = useState<{ type: string; variantId: string } | null>(
    null,
  );

  const addSection = useBuilderStore((state) => state.addSection);
  const replaceSection = useBuilderStore((state) => state.replaceSection);

  useEffect(() => {
    if (!open || !config) {
      return;
    }

    if (config.mode === "replace") {
      setActiveType(config.sectionType);
      setSelected({ type: config.sectionType, variantId: config.currentVariantId });
    } else {
      setActiveType(allTypes[0]?.type ?? "hero");
      setSelected(null);
    }
  }, [open, config, allTypes]);

  const activeDef = sectionRegistry[activeType];

  if (!open || !config || !activeDef) {
    return null;
  }

  const handleSave = () => {
    if (!selected) {
      return;
    }

    if (config.mode === "replace") {
      replaceSection(config.sectionId, selected.type, selected.variantId);
    } else {
      addSection(selected.type, selected.variantId, config.insertAtIndex);
    }

    onClose();
  };

  const typeLabel = sectionRegistry[isReplace ? config.sectionType : activeType]?.label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close section library"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isReplace ? "Replace Section" : "Choose Section"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isReplace
              ? `Pick a new ${typeLabel?.toLowerCase() ?? "section"} layout to replace the current one.`
              : "Select a section type and variant to add to your page."}
          </p>
        </div>

        <div className={`picker-layout min-h-0 flex-1 ${isReplace ? "picker-layout--replace" : ""}`}>
          {!isReplace ? (
            <aside className="picker-sidebar">
              {sidebarTypes.map((def) => (
                <button
                  key={def.type}
                  type="button"
                  className={def.type === activeType ? "active" : ""}
                  onClick={() => {
                    setActiveType(def.type);
                    setSelected(null);
                  }}
                >
                  {def.label}
                </button>
              ))}
            </aside>
          ) : null}

          <div className="picker-grid">
            {activeDef.variants.map((variant) => {
              const PreviewComponent = variant.component;
              const isCurrent =
                isReplace &&
                config.mode === "replace" &&
                variant.id === config.currentVariantId;

              return (
                <button
                  key={variant.id}
                  type="button"
                  className={`variant-card ${
                    selected?.variantId === variant.id ? "selected" : ""
                  } ${isCurrent ? "variant-card--current" : ""}`}
                  onClick={() =>
                    setSelected({ type: activeType, variantId: variant.id })
                  }
                >
                  <span className="variant-label">
                    {variant.label}
                    {isCurrent ? " (current)" : ""}
                  </span>
                  <div className="variant-thumbnail">
                    <div className="thumbnail-scale-wrapper">
                      <EditModeContext.Provider value={{ isEditing: false }}>
                        <SectionDataProvider
                          data={variant.defaultProps}
                          updateField={() => {}}
                        >
                          <PreviewComponent {...variant.defaultProps} />
                        </SectionDataProvider>
                      </EditModeContext.Provider>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="picker-footer">
          <button type="button" className="editor-popover-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="editor-popover-btn editor-popover-btn--primary"
            disabled={
              !selected ||
              (isReplace &&
                config.mode === "replace" &&
                selected.variantId === config.currentVariantId &&
                selected.type === config.sectionType)
            }
            onClick={handleSave}
          >
            {isReplace ? "Replace" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
