"use client";

import { useState } from "react";
import FooterSimple from "@/components/sections/footer/FooterSimple";
import type { FooterSimpleProps } from "@/components/sections/footer/schema";
import HeaderSimple from "@/components/sections/header/HeaderSimple";
import { getHeaderProps, getHeaderVariantId } from "@/lib/header-utils";
import { findSectionVariant } from "@/lib/registry";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { resolveFixedSlotSettings } from "@/lib/traits/normalize";
import { useBuilderStore } from "@/store/builderStore";
import SectionSettingsPanel from "./SectionSettingsPanel";
import { IconReplace, IconSettings, SectionToolbarButton } from "./SectionToolbarButton";

function HeaderSlot({ onReplace }: { onReplace: () => void }) {
  const [hovered, setHovered] = useState(false);
  const navigation = useBuilderStore((state) => state.site.navigation);

  return (
    <div
      className="section-wrapper fixed-slot-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <>
          <span className="section-label-badge fixed-slot-badge">Header</span>
          <div className="section-toolbar fixed-slot-toolbar">
            <SectionToolbarButton title="Replace header" onClick={onReplace}>
              <IconReplace />
            </SectionToolbarButton>
          </div>
        </>
      ) : null}
      <HeaderSimple {...getHeaderProps(navigation)} />
    </div>
  );
}

function FooterSlot({ onReplace }: { onReplace: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const footer = useBuilderStore((state) => state.site.footer);
  const updateFooterSettings = useBuilderStore((state) => state.updateFooterSettings);
  const variant = findSectionVariant("footer", footer.variant);

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
        className="section-wrapper fixed-slot-wrapper"
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
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  <IconSettings />
                </SectionToolbarButton>
                {settingsOpen ? (
                  <SectionSettingsPanel
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
        <FooterSimple {...(footer.props as FooterSimpleProps)} />
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
