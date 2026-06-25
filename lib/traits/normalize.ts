import { normalizeTheme } from "@/lib/theme-defaults";
import { migrateThemeBoundSectionSettings } from "@/lib/theme-color-utils";
import { findSectionVariant } from "@/lib/registry";
import { getHeaderVariantId } from "@/lib/header-utils";
import { migrateFooterProps, migrateNavigation, migrateSectionProps } from "@/lib/migrate-content";
import { isFixedSlotType } from "@/lib/section-placement";
import type { SectionInstance, WebsiteData } from "@/lib/types";
import { buildVariantSettings } from "./registry";

function migrateLegacyStyle(section: SectionInstance): Record<string, unknown> {
  const legacy: Record<string, unknown> = {};

  if (section.style?.background) {
    legacy.type = "solid";
    legacy.color = section.style.background;
  }

  if (section.style?.paddingY) {
    legacy.paddingY = section.style.paddingY;
  }

  return legacy;
}

function migrateTraitSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...settings };

  if (!migrated.type && migrated.backgroundColor) {
    migrated.type = "solid";
    migrated.color = migrated.backgroundColor;
    delete migrated.backgroundColor;
  }

  if (migrated.overlayColor !== undefined && migrated.opacity !== undefined && !migrated.overlayOpacity) {
    migrated.overlayOpacity = migrated.opacity;
    delete migrated.opacity;
  }

  return migrated;
}

export function resolveSectionSettings(
  section: SectionInstance,
  traitIds: string[],
  settingsDefaults?: Record<string, unknown>,
): Record<string, unknown> {
  const merged = migrateTraitSettings({
    ...buildVariantSettings(traitIds, settingsDefaults),
    ...migrateLegacyStyle(section),
    ...(section.settings ?? {}),
  });

  return migrateThemeBoundSectionSettings(merged, section.type, section.variant);
}

export function resolveFixedSlotSettings(
  storedSettings: Record<string, unknown> | undefined,
  traitIds: string[],
  settingsDefaults?: Record<string, unknown>,
  slotType = "footer",
  variantId = "footer-simple",
): Record<string, unknown> {
  const merged = migrateTraitSettings({
    ...buildVariantSettings(traitIds, settingsDefaults),
    ...(storedSettings ?? {}),
  });

  return migrateThemeBoundSectionSettings(merged, slotType, variantId);
}

export function normalizeSiteSections(site: WebsiteData): WebsiteData {
  const headerVariant = findSectionVariant("header", getHeaderVariantId(site.navigation));
  const footerVariant = findSectionVariant("footer", site.footer.variant);

  const navigation = migrateNavigation({
    ...site.navigation,
    settings: headerVariant
      ? resolveFixedSlotSettings(
          site.navigation.settings,
          headerVariant.traits,
          headerVariant.settingsDefaults,
        )
      : site.navigation.settings,
  });

  const footer = {
    ...site.footer,
    props: migrateFooterProps(site.footer.props),
    settings: footerVariant
      ? resolveFixedSlotSettings(
          site.footer.settings,
          footerVariant.traits,
          footerVariant.settingsDefaults,
          "footer",
          site.footer.variant,
        )
      : site.footer.settings,
  };

  return {
    ...site,
    navigation,
    footer,
    pages: site.pages.map((page) => ({
      ...page,
      sections: page.sections
        .filter((section) => !isFixedSlotType(section.type))
        .map((section) => {
          const variant = findSectionVariant(section.type, section.variant);
          if (!variant) {
            return { ...section, settings: migrateTraitSettings(section.settings ?? {}) };
          }

          return {
            ...section,
            props: migrateSectionProps(section.type, section.variant, section.props),
            settings: resolveSectionSettings(
              section,
              variant.traits,
              variant.settingsDefaults,
            ),
          };
        }),
    })),
    savedSections: site.savedSections ?? [],
    customThemes: site.customThemes ?? [],
    theme: normalizeTheme(site.theme),
  };
}
