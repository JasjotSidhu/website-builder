"use client";

import { EditModeContext } from "@/lib/editor/EditModeContext";
import { ThemeProvider } from "@/lib/editor/ThemeContext";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import type { SectionVariant } from "@/lib/registry";
import { getVariantPreview } from "@/lib/preview-props";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import type { ThemeConfig } from "@/lib/types";
import { SectionSettingsProvider } from "@/lib/traits/context";

interface SectionVariantPreviewProps {
  type: string;
  variant: SectionVariant;
  theme: ThemeConfig;
}

export default function SectionVariantPreview({
  type,
  variant,
  theme,
}: SectionVariantPreviewProps) {
  const PreviewComponent = variant.component;
  const { props, settings } = getVariantPreview(type, variant.id);
  const themeStyle = buildThemeCssVariables(theme);
  const { minHeight: _minHeight, ...previewThemeStyle } = themeStyle;

  return (
    <div className="variant-preview-theme" style={previewThemeStyle}>
      <EditModeContext.Provider value={{ isEditing: false }}>
        <ThemeProvider theme={theme}>
          <SiteProvider pages={[{ id: "home", title: "Home", slug: "/" }]}>
            <SectionSettingsProvider settings={settings}>
              <SectionDataProvider data={props} updateField={() => {}} updateFields={() => {}}>
                <PreviewComponent />
              </SectionDataProvider>
            </SectionSettingsProvider>
          </SiteProvider>
        </ThemeProvider>
      </EditModeContext.Provider>
    </div>
  );
}
