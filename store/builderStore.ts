"use client";

import { create } from "zustand";
import sampleSite from "@/data/sample-site.json";
import { findSectionVariant } from "@/lib/registry";
import { websiteSchema } from "@/lib/schemas";
import { buildVariantSettings } from "@/lib/traits/registry";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { SectionInstance, ThemeConfig, WebsiteData } from "@/lib/types";

interface BuilderState {
  site: WebsiteData;
  addSection: (type: string, variantId: string, atIndex?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSectionProps: (id: string, props: Record<string, unknown>) => void;
  updateSectionSettings: (id: string, partialSettings: Record<string, unknown>) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  toggleSectionHidden: (id: string) => void;
  resetSectionToDefault: (id: string) => void;
  replaceSection: (id: string, type: string, variantId: string) => void;
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getHomepage(state: BuilderState) {
  return state.site.pages[0];
}

function updateHomepageSections(
  site: WebsiteData,
  sections: SectionInstance[],
): WebsiteData {
  return {
    ...site,
    pages: [{ ...site.pages[0], sections }, ...site.pages.slice(1)],
  };
}

const initialSite = normalizeSiteSections(
  websiteSchema.parse(sampleSite) as WebsiteData,
);

export const useBuilderStore = create<BuilderState>((set) => ({
  site: initialSite,

  addSection: (type, variantId, atIndex) => {
    const variant = findSectionVariant(type, variantId);
    if (!variant) {
      return;
    }

    const section: SectionInstance = {
      id: createSectionId(),
      type,
      variant: variantId,
      props: structuredClone(variant.defaultProps),
      settings: buildVariantSettings(variant.traits, variant.settingsDefaults),
    };

    set((state) => {
      const sections = [...getHomepage(state).sections];
      const index = atIndex ?? sections.length;
      sections.splice(index, 0, section);
      return { site: updateHomepageSections(state.site, sections) };
    });
  },

  removeSection: (id) => {
    set((state) => ({
      site: updateHomepageSections(
        state.site,
        getHomepage(state).sections.filter((section) => section.id !== id),
      ),
    }));
  },

  duplicateSection: (id) => {
    set((state) => {
      const sections = [...getHomepage(state).sections];
      const index = sections.findIndex((section) => section.id === id);
      if (index === -1) {
        return state;
      }

      const clone: SectionInstance = {
        ...structuredClone(sections[index]),
        id: createSectionId(),
      };

      sections.splice(index + 1, 0, clone);
      return { site: updateHomepageSections(state.site, sections) };
    });
  },

  reorderSections: (fromIndex, toIndex) => {
    set((state) => {
      const sections = [...getHomepage(state).sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { site: updateHomepageSections(state.site, sections) };
    });
  },

  updateSectionProps: (id, props) => {
    set((state) => ({
      site: updateHomepageSections(
        state.site,
        getHomepage(state).sections.map((section) =>
          section.id === id ? { ...section, props } : section,
        ),
      ),
    }));
  },

  updateSectionSettings: (id, partialSettings) => {
    set((state) => ({
      site: updateHomepageSections(
        state.site,
        getHomepage(state).sections.map((section) =>
          section.id === id
            ? { ...section, settings: { ...section.settings, ...partialSettings } }
            : section,
        ),
      ),
    }));
  },

  updateTheme: (theme) => {
    set((state) => ({
      site: {
        ...state.site,
        theme: {
          ...state.site.theme,
          ...theme,
          colors: {
            ...state.site.theme.colors,
            ...theme.colors,
          },
          fonts: {
            ...state.site.theme.fonts,
            ...theme.fonts,
          },
        },
      },
    }));
  },

  toggleSectionHidden: (id) => {
    set((state) => ({
      site: updateHomepageSections(
        state.site,
        getHomepage(state).sections.map((section) =>
          section.id === id ? { ...section, hidden: !section.hidden } : section,
        ),
      ),
    }));
  },

  resetSectionToDefault: (id) => {
    set((state) => {
      const sections = getHomepage(state).sections.map((section) => {
        if (section.id !== id) {
          return section;
        }

        const variant = findSectionVariant(section.type, section.variant);
        if (!variant) {
          return section;
        }

        return {
          ...section,
          props: structuredClone(variant.defaultProps),
          settings: buildVariantSettings(variant.traits, variant.settingsDefaults),
        };
      });

      return { site: updateHomepageSections(state.site, sections) };
    });
  },

  replaceSection: (id, type, variantId) => {
    const variant = findSectionVariant(type, variantId);
    if (!variant) {
      return;
    }

    set((state) => {
      const sections = getHomepage(state).sections.map((section) => {
        if (section.id !== id) {
          return section;
        }

        return {
          ...section,
          type,
          variant: variantId,
          props: structuredClone(variant.defaultProps),
          settings: buildVariantSettings(variant.traits, variant.settingsDefaults),
        };
      });

      return { site: updateHomepageSections(state.site, sections) };
    });
  },
}));
