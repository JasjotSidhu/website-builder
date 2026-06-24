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

export default function FixedSlotWrapper({
  slot,
  onReplace,
}: {
  slot: "header" | "footer";
  onReplace: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigation = useBuilderStore((state) => state.site.navigation);
  const footer = useBuilderStore((state) => state.site.footer);
  const updateNavigationSettings = useBuilderStore((state) => state.updateNavigationSettings);
  const updateFooterSettings = useBuilderStore((state) => state.updateFooterSettings);

  const type = slot === "header" ? "header" : "footer";
  const variantId =
    slot === "header" ? getHeaderVariantId(navigation) : footer.variant;
  const variant = findSectionVariant(type, variantId);

  if (!variant) {
    return null;
  }

  const storedSettings = slot === "header" ? navigation.settings : footer.settings;
  const resolvedSettings = resolveFixedSlotSettings(
    storedSettings,
    variant.traits,
    variant.settingsDefaults,
  );
  const label = slot === "header" ? "Header" : "Footer";
  const onUpdate =
    slot === "header" ? updateNavigationSettings : updateFooterSettings;

  return (
    <SectionSettingsProvider settings={resolvedSettings}>
      <div
        className="section-wrapper fixed-slot-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered || settingsOpen ? (
          <>
            <span className="section-label-badge fixed-slot-badge">{label}</span>
            <div className="section-toolbar fixed-slot-toolbar">
              <div className="relative">
                <SectionToolbarButton
                  title={`${label} settings`}
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  <IconSettings />
                </SectionToolbarButton>
                {settingsOpen ? (
                  <SectionSettingsPanel
                    title={`${label} settings`}
                    settings={resolvedSettings}
                    variant={variant}
                    onUpdate={onUpdate}
                    onClose={() => setSettingsOpen(false)}
                  />
                ) : null}
              </div>
              <SectionToolbarButton title={`Replace ${label.toLowerCase()}`} onClick={onReplace}>
                <IconReplace />
              </SectionToolbarButton>
            </div>
          </>
        ) : null}
        {slot === "header" ? (
          <HeaderSimple {...getHeaderProps(navigation)} />
        ) : (
          <FooterSimple {...(footer.props as FooterSimpleProps)} />
        )}
      </div>
    </SectionSettingsProvider>
  );
}
