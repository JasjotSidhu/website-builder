import type { SectionVariant } from "@/lib/registry";
import type { TraitCategory } from "./types";
import { isTraitFieldVisible } from "./field-utils";
import { traitCategoryTabs, traitRegistry } from "./registry";

export interface SettingsTab {
  id: TraitCategory;
  label: string;
  traitIds: string[];
}

export function buildSettingsTabs(
  variant: SectionVariant,
  settings: Record<string, unknown>,
): SettingsTab[] {
  return traitCategoryTabs
    .map((tab) => {
      const traitIds = variant.traits.filter((traitId) => {
        const trait = traitRegistry[traitId];
        if (!trait || trait.category !== tab.id) {
          return false;
        }

        const visibleFields = trait.fields.filter((field) =>
          isTraitFieldVisible(field, settings),
        );
        return visibleFields.length > 0;
      });

      return { ...tab, traitIds };
    })
    .filter((tab) => tab.traitIds.length > 0);
}

export const tabSubtitles: Record<TraitCategory, string> = {
  background: "Colors, gradients & images",
  typography: "Default text color",
  layout: "Spacing, grid & column order",
  fonts: "Heading and body font overrides",
};
