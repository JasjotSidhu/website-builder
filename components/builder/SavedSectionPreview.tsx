"use client";

import { EditModeContext } from "@/lib/editor/EditModeContext";
import { ThemeProvider } from "@/lib/editor/ThemeContext";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import type { SavedSection } from "@/lib/types";
import { findSectionVariant } from "@/lib/registry";
import type { ThemeConfig } from "@/lib/types";
import { SectionSettingsProvider } from "@/lib/traits/context";
import SectionLibraryPreviewFrame from "./SectionLibraryPreviewFrame";

interface SavedSectionPreviewProps {
  saved: SavedSection;
  theme: ThemeConfig;
}

export default function SavedSectionPreview({ saved, theme }: SavedSectionPreviewProps) {
  const match = findSectionVariant(saved.type, saved.variant);
  if (!match) {
    return (
      <div className="section-library-preview section-library-preview--empty">
        Preview unavailable
      </div>
    );
  }

  const PreviewComponent = match.component;

  return (
    <SectionLibraryPreviewFrame theme={theme}>
      <EditModeContext.Provider value={{ isEditing: false }}>
        <ThemeProvider theme={theme}>
          <SiteProvider pages={[{ id: "home", title: "Home", slug: "/" }]}>
            <SectionSettingsProvider settings={saved.settings}>
              <SectionDataProvider
                data={saved.props}
                updateField={() => {}}
                updateFields={() => {}}
              >
                <PreviewComponent />
              </SectionDataProvider>
            </SectionSettingsProvider>
          </SiteProvider>
        </ThemeProvider>
      </EditModeContext.Provider>
    </SectionLibraryPreviewFrame>
  );
}
