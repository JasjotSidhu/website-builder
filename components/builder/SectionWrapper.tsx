"use client";

import { useCallback, useState } from "react";
import { sectionRegistry } from "@/lib/registry";
import type { SectionInstance } from "@/lib/types";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { resolveSectionSettings } from "@/lib/traits/normalize";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import SectionSettingsPanel from "./SectionSettingsPanel";
import {
  IconArrowDown,
  IconArrowUp,
  IconDelete,
  IconDuplicate,
  IconHide,
  IconReplace,
  IconSettings,
  SectionToolbarButton,
} from "./SectionToolbarButton";

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
    patchSectionProps,
    updateSectionSettings,
    duplicateSection,
    removeSection,
    toggleSectionHidden,
    reorderSections,
  } = useBuilderStore();

  const definition = sectionRegistry[section.type];
  const variant = definition?.variants.find((entry) => entry.id === section.variant);
  const isFixed = section.type === "header" || section.type === "footer";

  if (!definition || !variant) {
    return null;
  }

  const Component = variant.component;

  const updateField = useCallback(
    (key: string, value: unknown) => {
      patchSectionProps(section.id, { [key]: value });
    },
    [patchSectionProps, section.id],
  );

  const updateFields = useCallback(
    (partial: Record<string, unknown>) => {
      patchSectionProps(section.id, partial);
    },
    [patchSectionProps, section.id],
  );

  const resolvedSettings = resolveSectionSettings(
    section,
    variant.traits,
    variant.settingsDefaults,
  );

  return (
    <SectionSettingsProvider settings={resolvedSettings}>
      <SectionDataProvider
        data={section.props}
        updateField={updateField}
        updateFields={updateFields}
      >
        <div
          className="section-wrapper"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ opacity: section.hidden ? 0.4 : 1, position: "relative" }}
        >
          {hovered ? <AddSectionButton onClick={() => onAddSection(index)} /> : null}
          {hovered || settingsOpen ? (
            <>
              <span className="section-label-badge">{variant.label}</span>
              <div className="section-toolbar">
                <div className="relative">
                  <SectionToolbarButton
                    title="Section settings"
                    onClick={() => setSettingsOpen((open) => !open)}
                  >
                    <IconSettings />
                  </SectionToolbarButton>
                  {settingsOpen ? (
                    <SectionSettingsPanel
                      settings={resolvedSettings}
                      variant={variant}
                      onUpdate={(partial) => updateSectionSettings(section.id, partial)}
                      onClose={() => setSettingsOpen(false)}
                    />
                  ) : null}
                </div>
                <SectionToolbarButton
                  title="Replace section"
                  onClick={() =>
                    onReplaceSection(section.id, section.type, section.variant)
                  }
                >
                  <IconReplace />
                </SectionToolbarButton>
                <SectionToolbarButton
                  title="Duplicate"
                  disabled={isFixed}
                  onClick={() => duplicateSection(section.id)}
                >
                  <IconDuplicate />
                </SectionToolbarButton>
                <SectionToolbarButton
                  title="Hide"
                  disabled={isFixed}
                  onClick={() => toggleSectionHidden(section.id)}
                >
                  <IconHide />
                </SectionToolbarButton>
                <SectionToolbarButton
                  title="Move up"
                  disabled={index === 0 || isFixed}
                  onClick={() => reorderSections(index, index - 1)}
                >
                  <IconArrowUp />
                </SectionToolbarButton>
                <SectionToolbarButton
                  title="Move down"
                  disabled={index === totalSections - 1 || isFixed}
                  onClick={() => reorderSections(index, index + 1)}
                >
                  <IconArrowDown />
                </SectionToolbarButton>
                <SectionToolbarButton
                  title="Delete"
                  variant="danger"
                  disabled={isFixed}
                  onClick={() => removeSection(section.id)}
                >
                  <IconDelete />
                </SectionToolbarButton>
              </div>
            </>
          ) : null}
          {section.hidden ? <span className="hidden-badge">Hidden</span> : null}
          <Component />
        </div>
      </SectionDataProvider>
    </SectionSettingsProvider>
  );
}
