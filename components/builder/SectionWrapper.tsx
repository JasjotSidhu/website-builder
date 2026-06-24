"use client";

import { useState } from "react";
import { sectionRegistry } from "@/lib/registry";
import type { SectionInstance } from "@/lib/types";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import SectionSettingsPanel from "./SectionSettingsPanel";

function ToolbarButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className="section-toolbar-btn"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function SectionWrapper({
  section,
  index,
  totalSections,
  onAddSection,
  onReplaceSection,
}: {
  section: SectionInstance;
  index: number;
  totalSections: number;
  onAddSection: (atIndex: number) => void;
  onReplaceSection: (
    sectionId: string,
    sectionType: string,
    currentVariantId: string,
  ) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    updateSectionProps,
    duplicateSection,
    removeSection,
    toggleSectionHidden,
    reorderSections,
  } = useBuilderStore();

  const definition = sectionRegistry[section.type];
  const variant = definition?.variants.find((entry) => entry.id === section.variant);

  if (!definition || !variant) {
    return null;
  }

  const Component = variant.component;

  const updateField = (key: string, value: unknown) => {
    updateSectionProps(section.id, { ...section.props, [key]: value });
  };

  return (
    <SectionSettingsProvider settings={section.settings}>
      <SectionDataProvider data={section.props} updateField={updateField}>
        <div
          className="section-wrapper"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setSettingsOpen(false);
          }}
          style={{ opacity: section.hidden ? 0.4 : 1, position: "relative" }}
        >
          {hovered ? <AddSectionButton onClick={() => onAddSection(index)} /> : null}
          {hovered || settingsOpen ? (
            <>
              <span className="section-label-badge">{variant.label}</span>
              <div className="section-toolbar">
                <div className="relative">
                  <ToolbarButton
                    title="Section settings"
                    onClick={() => setSettingsOpen((open) => !open)}
                  >
                    ⚙
                  </ToolbarButton>
                  {settingsOpen ? (
                    <SectionSettingsPanel
                      section={section}
                      variant={variant}
                      onClose={() => setSettingsOpen(false)}
                    />
                  ) : null}
                </div>
                <ToolbarButton
                  title="Replace section"
                  onClick={() =>
                    onReplaceSection(section.id, section.type, section.variant)
                  }
                >
                  ⇄
                </ToolbarButton>
                <ToolbarButton
                  title="Duplicate"
                  onClick={() => duplicateSection(section.id)}
                >
                  ⧉
                </ToolbarButton>
                <ToolbarButton
                  title="Hide"
                  onClick={() => toggleSectionHidden(section.id)}
                >
                  ◌
                </ToolbarButton>
                <ToolbarButton
                  title="Move up"
                  disabled={index === 0}
                  onClick={() => reorderSections(index, index - 1)}
                >
                  ↑
                </ToolbarButton>
                <ToolbarButton
                  title="Move down"
                  disabled={index === totalSections - 1}
                  onClick={() => reorderSections(index, index + 1)}
                >
                  ↓
                </ToolbarButton>
                <ToolbarButton title="Delete" onClick={() => removeSection(section.id)}>
                  ✕
                </ToolbarButton>
              </div>
            </>
          ) : null}
          {section.hidden ? <span className="hidden-badge">Hidden</span> : null}
          <Component {...section.props} />
        </div>
      </SectionDataProvider>
    </SectionSettingsProvider>
  );
}
