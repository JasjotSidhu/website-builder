"use client";

import { useCallback, useRef, useState } from "react";
import FooterSimple from "@/components/sections/footer/FooterSimple";
import HeaderSimple from "@/components/sections/header/HeaderSimple";
import { getHeaderProps, getHeaderVariantId } from "@/lib/header-utils";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { findSectionVariant } from "@/lib/registry";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { resolveFixedSlotSettings } from "@/lib/traits/normalize";
import { useCloseOnOutsideClick } from "@/lib/hooks/use-close-on-outside-click";
import { useBuilderStore } from "@/store/builderStore";
import SectionSettingsPanel from "./SectionSettingsPanel";
import { IconReplace, IconSettings, SectionToolbarButton } from "./SectionToolbarButton";

function HeaderSlot({ onReplace }: { onReplace: () => void }) {
  const [hovered, setHovered] = useState(false);
  const navigation = useBuilderStore((state) => state.site.navigation);
  const patchNavigation = useBuilderStore((state) => state.patchNavigation);
  const openHeaderSettings = useBuilderStore((state) => state.openHeaderSettings);
  const highlightedSectionId = useBuilderStore((state) => state.highlightedSectionId);
  const headerProps = getHeaderProps(navigation);

  const updateField = useCallback(
    (key: string, value: unknown) => {
      patchNavigation({ [key]: value });
    },
    [patchNavigation],
  );

  const updateFields = useCallback(
    (partial: Record<string, unknown>) => {
      patchNavigation(partial);
    },
    [patchNavigation],
  );

  return (
    <div
      data-section-id="header"
      className={`section-wrapper fixed-slot-wrapper${
        highlightedSectionId === "header" ? " section-wrapper--highlighted" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <>
          <div className="header-interaction-overlay" aria-hidden />
          <span className="section-label-badge fixed-slot-badge">Header</span>
          <button type="button" className="header-edit-overlay-btn" onClick={openHeaderSettings}>
            <IconSettings />
            Edit Header
          </button>
          <div className="section-toolbar fixed-slot-toolbar">
            <SectionToolbarButton title="Replace header" onClick={onReplace}>
              <IconReplace />
            </SectionToolbarButton>
          </div>
        </>
      ) : null}
      <SectionDataProvider
        data={headerProps as Record<string, unknown>}
        updateField={updateField}
        updateFields={updateFields}
      >
        <HeaderSimple />
      </SectionDataProvider>
    </div>
  );
}

function FooterSlot({ onReplace }: { onReplace: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsAnchorRef = useRef<HTMLButtonElement>(null);
  const settingsPopoverRef = useRef<HTMLDivElement>(null);
  const footer = useBuilderStore((state) => state.site.footer);
  const patchFooterProps = useBuilderStore((state) => state.patchFooterProps);
  const updateFooterSettings = useBuilderStore((state) => state.updateFooterSettings);
  const highlightedSectionId = useBuilderStore((state) => state.highlightedSectionId);
  const variant = findSectionVariant("footer", footer.variant);

  const updateField = useCallback(
    (key: string, value: unknown) => {
      patchFooterProps({ [key]: value });
    },
    [patchFooterProps],
  );

  const updateFields = useCallback(
    (partial: Record<string, unknown>) => {
      patchFooterProps(partial);
    },
    [patchFooterProps],
  );

  useCloseOnOutsideClick(
    settingsOpen,
    () => setSettingsOpen(false),
    settingsPopoverRef,
    settingsAnchorRef,
  );

  if (!variant) {
    return null;
  }

  const resolvedSettings = resolveFixedSlotSettings(
    footer.settings,
    variant.traits,
    variant.settingsDefaults,
  );

  return (
    <SectionSettingsProvider settings={resolvedSettings}>
      <div
        data-section-id="footer"
        className={`section-wrapper fixed-slot-wrapper${
          highlightedSectionId === "footer" ? " section-wrapper--highlighted" : ""
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered || settingsOpen ? (
          <>
            <span className="section-label-badge fixed-slot-badge">Footer</span>
            <div className="section-toolbar fixed-slot-toolbar">
              <div className="relative">
                <SectionToolbarButton
                  title="Footer settings"
                  buttonRef={settingsAnchorRef}
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  <IconSettings />
                </SectionToolbarButton>
                {settingsOpen ? (
                  <SectionSettingsPanel
                    popoverRef={settingsPopoverRef}
                    title="Footer settings"
                    settings={resolvedSettings}
                    variant={variant}
                    onUpdate={updateFooterSettings}
                    onClose={() => setSettingsOpen(false)}
                  />
                ) : null}
              </div>
              <SectionToolbarButton title="Replace footer" onClick={onReplace}>
                <IconReplace />
              </SectionToolbarButton>
            </div>
          </>
        ) : null}
        <SectionDataProvider
          data={footer.props}
          updateField={updateField}
          updateFields={updateFields}
        >
          <FooterSimple />
        </SectionDataProvider>
      </div>
    </SectionSettingsProvider>
  );
}

export default function FixedSlotWrapper({
  slot,
  onReplace,
}: {
  slot: "header" | "footer";
  onReplace: () => void;
}) {
  if (slot === "header") {
    return <HeaderSlot onReplace={onReplace} />;
  }

  return <FooterSlot onReplace={onReplace} />;
}
