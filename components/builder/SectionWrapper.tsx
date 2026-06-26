"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { sectionRegistry } from "@/lib/registry";
import type { SectionInstance } from "@/lib/types";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { buildSectionTypographyStyle } from "@/lib/theme-utils";
import { resolveSectionSettings } from "@/lib/traits/normalize";
import {
  isTestimonialsCollectionMode,
  resolveSectionRenderProps,
} from "@/lib/collections/resolve-section-props";
import { DEFAULT_TESTIMONIALS_COLLECTION_ID } from "@/lib/collections/types";
import type { TestimonialDisplayItem } from "@/lib/collections/testimonials";
import { useCloseOnOutsideClick } from "@/lib/hooks/use-close-on-outside-click";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import SaveSectionPopover from "./SaveSectionPopover";
import SectionSettingsPanel from "./SectionSettingsPanel";
import TestimonialsShareToggle from "./TestimonialsShareToggle";
import {
  IconArrowDown,
  IconArrowUp,
  IconDelete,
  IconDuplicate,
  IconHide,
  IconReplace,
  IconSave,
  IconSettings,
  SectionToolbarButton,
} from "./SectionToolbarButton";

function getSectionDefaultName(section: SectionInstance) {
  const heading = section.props.heading;
  if (typeof heading === "string" && heading.trim()) {
    return heading.trim().slice(0, 80);
  }

  const definition = sectionRegistry[section.type];
  const variant = definition?.variants.find((entry) => entry.id === section.variant);
  return variant?.label ?? "Saved section";
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
  const [saveOpen, setSaveOpen] = useState(false);
  const settingsAnchorRef = useRef<HTMLButtonElement>(null);
  const settingsPopoverRef = useRef<HTMLDivElement>(null);
  const saveAnchorRef = useRef<HTMLButtonElement>(null);
  const {
    patchSectionProps,
    updateSectionSettings,
    updateSectionCustomClass,
    saveSectionPreset,
    duplicateSection,
    removeSection,
    toggleSectionHidden,
    reorderSections,
    setTestimonialsCollectionItems,
  } = useBuilderStore();
  const site = useBuilderStore((state) => state.site);
  const highlightedSectionId = useBuilderStore((state) => state.highlightedSectionId);

  const definition = sectionRegistry[section.type];
  const variant = definition?.variants.find((entry) => entry.id === section.variant);
  const isFixed = section.type === "header" || section.type === "footer";
  const resolvedProps = useMemo(
    () => resolveSectionRenderProps(site, section),
    [site, section],
  );
  const isSharedTestimonials =
    section.type === "testimonials" && isTestimonialsCollectionMode(section.props);

  const updateField = useCallback(
    (key: string, value: unknown) => {
      if (key === "testimonials" && isSharedTestimonials) {
        setTestimonialsCollectionItems(
          DEFAULT_TESTIMONIALS_COLLECTION_ID,
          value as TestimonialDisplayItem[],
        );
        return;
      }

      patchSectionProps(section.id, { [key]: value });
    },
    [patchSectionProps, section.id, setTestimonialsCollectionItems, isSharedTestimonials],
  );

  const updateFields = useCallback(
    (partial: Record<string, unknown>) => {
      if (isSharedTestimonials && "testimonials" in partial) {
        setTestimonialsCollectionItems(
          DEFAULT_TESTIMONIALS_COLLECTION_ID,
          partial.testimonials as TestimonialDisplayItem[],
        );
        const { testimonials: _ignored, ...rest } = partial;
        if (Object.keys(rest).length > 0) {
          patchSectionProps(section.id, rest);
        }
        return;
      }

      patchSectionProps(section.id, partial);
    },
    [patchSectionProps, section.id, setTestimonialsCollectionItems, isSharedTestimonials],
  );

  useCloseOnOutsideClick(
    settingsOpen,
    () => setSettingsOpen(false),
    settingsPopoverRef,
    settingsAnchorRef,
  );

  if (!definition || !variant) {
    return null;
  }

  const Component = variant.component;
  const resolvedSettings = resolveSectionSettings(
    section,
    variant.traits,
    variant.settingsDefaults,
  );

  const wrapperClassName = [
    "section-wrapper",
    "section-typography",
    highlightedSectionId === section.id ? "section-wrapper--highlighted" : "",
    section.customClass ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const typographyStyle = buildSectionTypographyStyle(resolvedSettings);

  return (
    <SectionSettingsProvider settings={resolvedSettings}>
      <SectionDataProvider
        data={resolvedProps}
        updateField={updateField}
        updateFields={updateFields}
      >
        <div
          data-section-id={section.id}
          className={wrapperClassName}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ opacity: section.hidden ? 0.4 : 1, position: "relative", ...typographyStyle }}
        >
          {hovered ? <AddSectionButton onClick={() => onAddSection(index)} /> : null}
          {hovered || settingsOpen || saveOpen ? (
            <>
              <span className="section-label-badge">
                {variant.label}
                {section.type === "testimonials" && isTestimonialsCollectionMode(section.props)
                  ? " · Shared"
                  : ""}
              </span>
              <div className="section-toolbar">
                <div className="relative">
                  <SectionToolbarButton
                    title="Section settings"
                    buttonRef={settingsAnchorRef}
                    onClick={() => {
                      setSaveOpen(false);
                      setSettingsOpen((open) => !open);
                    }}
                  >
                    <IconSettings />
                  </SectionToolbarButton>
                  {settingsOpen ? (
                    <SectionSettingsPanel
                      popoverRef={settingsPopoverRef}
                      settings={resolvedSettings}
                      variant={variant}
                      customClass={section.customClass ?? ""}
                      onCustomClassChange={(value) =>
                        updateSectionCustomClass(section.id, value)
                      }
                      onUpdate={(partial) => updateSectionSettings(section.id, partial)}
                      onClose={() => setSettingsOpen(false)}
                      headerContent={
                        section.type === "testimonials" ? (
                          <TestimonialsShareToggle
                            sectionId={section.id}
                            sectionProps={section.props}
                          />
                        ) : undefined
                      }
                    />
                  ) : null}
                </div>
                <div className="relative">
                  <SectionToolbarButton
                    title="Save section"
                    buttonRef={saveAnchorRef}
                    disabled={isFixed}
                    onClick={() => {
                      setSettingsOpen(false);
                      setSaveOpen((open) => !open);
                    }}
                  >
                    <IconSave />
                  </SectionToolbarButton>
                  {saveOpen ? (
                    <SaveSectionPopover
                      anchorRef={saveAnchorRef}
                      defaultName={getSectionDefaultName(section)}
                      onClose={() => setSaveOpen(false)}
                      onSave={(name) => {
                        saveSectionPreset(section.id, name);
                        setSaveOpen(false);
                      }}
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
