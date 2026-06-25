import { normalizeFontConfig } from "./font-utils";
import type { SectionInstance, ThemeFontConfig, WebsiteData } from "../types";

export function collectSiteFonts(site: WebsiteData): ThemeFontConfig[] {
  const fonts: ThemeFontConfig[] = [
    normalizeFontConfig(site.theme.fonts.heading),
    normalizeFontConfig(site.theme.fonts.body),
  ];

  for (const page of site.pages) {
    for (const section of page.sections) {
      collectSectionFontOverrides(section, fonts);
    }
  }

  return fonts;
}

function collectSectionFontOverrides(section: SectionInstance, fonts: ThemeFontConfig[]) {
  const settings = section.settings ?? {};

  if (settings.headingFontInherit === false && settings.headingFont) {
    fonts.push(normalizeFontConfig(settings.headingFont));
  }

  if (settings.bodyFontInherit === false && settings.bodyFont) {
    fonts.push(normalizeFontConfig(settings.bodyFont));
  }
}
