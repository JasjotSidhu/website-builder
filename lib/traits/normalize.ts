import { findSectionVariant } from "@/lib/registry";
import type { SectionInstance, WebsiteData } from "@/lib/types";
import { buildVariantSettings } from "./registry";

function migrateLegacyStyle(section: SectionInstance): Record<string, unknown> {
  const legacy: Record<string, unknown> = {};

  if (section.style?.background) {
    legacy.backgroundColor = section.style.background;
  }

  if (section.style?.paddingY) {
    legacy.paddingY = section.style.paddingY;
  }

  return legacy;
}

export function resolveSectionSettings(
  section: SectionInstance,
  traitIds: string[],
  settingsDefaults?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...buildVariantSettings(traitIds, settingsDefaults),
    ...migrateLegacyStyle(section),
    ...(section.settings ?? {}),
  };
}

export function normalizeSiteSections(site: WebsiteData): WebsiteData {
  return {
    ...site,
    pages: site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => {
        const variant = findSectionVariant(section.type, section.variant);
        if (!variant) {
          return { ...section, settings: section.settings ?? {} };
        }

        return {
          ...section,
          settings: resolveSectionSettings(
            section,
            variant.traits,
            variant.settingsDefaults,
          ),
        };
      }),
    })),
  };
}
