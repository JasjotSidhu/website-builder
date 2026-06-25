"use client";

import { create } from "zustand";
import sampleSite from "@/data/sample-site.json";
import { findSectionVariant } from "@/lib/registry";
import { normalizePageSlug, validatePageSlug } from "@/lib/page-slugs";
import { websiteSchema } from "@/lib/schemas";
import { buildVariantSettings } from "@/lib/traits/registry";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type {
  FooterConfig,
  NavigationConfig,
  PageData,
  SectionInstance,
  ThemeConfig,
  WebsiteData,
} from "@/lib/types";
import { isFixedSlotType } from "@/lib/section-placement";

interface BuilderState {
  site: WebsiteData;
  activePageId: string;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;

  loadSite: () => Promise<void>;
  saveSite: () => Promise<void>;
  addPage: (title: string, slug: string) => string | null;
  removePage: (id: string) => void;
  setActivePage: (id: string) => void;
  updatePageMeta: (
    id: string,
    meta: Partial<Pick<PageData, "title" | "slug" | "seo">>,
  ) => string | null;

  addSection: (type: string, variantId: string, atIndex?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSectionProps: (id: string, props: Record<string, unknown>) => void;
  patchSectionProps: (id: string, partial: Record<string, unknown>) => void;
  updateSectionSettings: (id: string, partialSettings: Record<string, unknown>) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  toggleSectionHidden: (id: string) => void;
  resetSectionToDefault: (id: string) => void;
  replaceSection: (id: string, type: string, variantId: string) => void;
  updateNavigation: (navigation: NavigationConfig) => void;
  patchNavigation: (partial: Record<string, unknown>) => void;
  updateNavigationSettings: (partialSettings: Record<string, unknown>) => void;
  updateFooter: (footer: FooterConfig) => void;
  patchFooterProps: (partial: Record<string, unknown>) => void;
  updateFooterSettings: (partialSettings: Record<string, unknown>) => void;
  replaceHeaderVariant: (variantId: string) => void;
  replaceFooterVariant: (variantId: string) => void;
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPageId() {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getActivePage(state: BuilderState): PageData {
  return (
    state.site.pages.find((page) => page.id === state.activePageId) ?? state.site.pages[0]
  );
}

function updateActivePageSections(
  site: WebsiteData,
  activePageId: string,
  sections: SectionInstance[],
): WebsiteData {
  return {
    ...site,
    pages: site.pages.map((page) =>
      page.id === activePageId ? { ...page, sections } : page,
    ),
  };
}

const fallbackSite = normalizeSiteSections(websiteSchema.parse(sampleSite) as WebsiteData);

export const useBuilderStore = create<BuilderState>((set, get) => ({
  site: fallbackSite,
  activePageId: fallbackSite.pages[0]?.id ?? "",
  isLoading: true,
  isSaving: false,
  isDirty: false,
  lastSavedAt: null,

  loadSite: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/site");
      if (!res.ok) {
        throw new Error("Failed to load site");
      }
      const site = normalizeSiteSections((await res.json()) as WebsiteData);
      set({
        site,
        activePageId: site.pages[0]?.id ?? "",
        isLoading: false,
        isDirty: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  saveSite: async () => {
    set({ isSaving: true });
    try {
      const { site } = get();
      const res = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      if (!res.ok) {
        throw new Error("Failed to save site");
      }
      set({ isSaving: false, isDirty: false, lastSavedAt: new Date() });
    } catch {
      set({ isSaving: false });
    }
  },

  addPage: (title, slug) => {
    const state = get();
    const normalizedSlug = normalizePageSlug(slug);
    const error = validatePageSlug(
      normalizedSlug,
      state.site.pages.map((page) => page.slug),
    );
    if (error) {
      return error;
    }

    const newPage: PageData = {
      id: createPageId(),
      title: title.trim() || "New Page",
      slug: normalizedSlug,
      sections: [],
    };

    set({
      site: { ...state.site, pages: [...state.site.pages, newPage] },
      activePageId: newPage.id,
      isDirty: true,
    });

    return null;
  },

  removePage: (id) => {
    set((state) => {
      if (state.site.pages.length <= 1) {
        return state;
      }

      const pages = state.site.pages.filter((page) => page.id !== id);
      return {
        site: { ...state.site, pages },
        activePageId: state.activePageId === id ? pages[0].id : state.activePageId,
        isDirty: true,
      };
    });
  },

  setActivePage: (id) => set({ activePageId: id }),

  updatePageMeta: (id, metaInput) => {
    const state = get();
    const current = state.site.pages.find((page) => page.id === id);
    if (!current) {
      return "Page not found.";
    }

    let meta = metaInput;
    if (meta.slug !== undefined) {
      const normalizedSlug = normalizePageSlug(meta.slug);
      const error = validatePageSlug(
        normalizedSlug,
        state.site.pages.map((page) => page.slug),
        current.slug,
      );
      if (error) {
        return error;
      }
      meta = { ...meta, slug: normalizedSlug };
    }

    set({
      site: {
        ...state.site,
        pages: state.site.pages.map((page) =>
          page.id === id ? { ...page, ...meta } : page,
        ),
      },
      isDirty: true,
    });

    return null;
  },

  addSection: (type, variantId, atIndex) => {
    if (isFixedSlotType(type)) {
      return;
    }

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
      const activePage = getActivePage(state);
      const sections = [...activePage.sections];
      const index = atIndex ?? sections.length;
      sections.splice(index, 0, section);
      return {
        site: updateActivePageSections(state.site, state.activePageId, sections),
        isDirty: true,
      };
    });
  },

  removeSection: (id) => {
    set((state) => {
      const activePage = getActivePage(state);
      const section = activePage.sections.find((entry) => entry.id === id);
      if (section && isFixedSlotType(section.type)) {
        return state;
      }

      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.filter((entry) => entry.id !== id),
        ),
        isDirty: true,
      };
    });
  },

  duplicateSection: (id) => {
    set((state) => {
      const activePage = getActivePage(state);
      const sections = [...activePage.sections];
      const index = sections.findIndex((section) => section.id === id);
      if (index === -1 || isFixedSlotType(sections[index].type)) {
        return state;
      }

      const clone: SectionInstance = {
        ...structuredClone(sections[index]),
        id: createSectionId(),
      };

      sections.splice(index + 1, 0, clone);
      return {
        site: updateActivePageSections(state.site, state.activePageId, sections),
        isDirty: true,
      };
    });
  },

  reorderSections: (fromIndex, toIndex) => {
    set((state) => {
      const activePage = getActivePage(state);
      const sections = [...activePage.sections];
      if (
        isFixedSlotType(sections[fromIndex]?.type ?? "") ||
        isFixedSlotType(sections[toIndex]?.type ?? "")
      ) {
        return state;
      }

      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return {
        site: updateActivePageSections(state.site, state.activePageId, sections),
        isDirty: true,
      };
    });
  },

  updateSectionProps: (id, props) => {
    set((state) => {
      const activePage = getActivePage(state);
      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.map((section) =>
            section.id === id ? { ...section, props } : section,
          ),
        ),
        isDirty: true,
      };
    });
  },

  patchSectionProps: (id, partial) => {
    set((state) => {
      const activePage = getActivePage(state);
      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.map((section) => {
            if (section.id !== id) {
              return section;
            }

            const next = { ...section.props };
            for (const [key, value] of Object.entries(partial)) {
              if (value === undefined || value === "") {
                delete next[key];
              } else {
                next[key] = value;
              }
            }

            return { ...section, props: next };
          }),
        ),
        isDirty: true,
      };
    });
  },

  updateSectionSettings: (id, partialSettings) => {
    set((state) => {
      const activePage = getActivePage(state);
      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.map((section) =>
            section.id === id
              ? { ...section, settings: { ...section.settings, ...partialSettings } }
              : section,
          ),
        ),
        isDirty: true,
      };
    });
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
      isDirty: true,
    }));
  },

  toggleSectionHidden: (id) => {
    set((state) => {
      const activePage = getActivePage(state);
      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.map((section) =>
            section.id === id ? { ...section, hidden: !section.hidden } : section,
          ),
        ),
        isDirty: true,
      };
    });
  },

  resetSectionToDefault: (id) => {
    set((state) => {
      const activePage = getActivePage(state);
      const sections = activePage.sections.map((section) => {
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

      return {
        site: updateActivePageSections(state.site, state.activePageId, sections),
        isDirty: true,
      };
    });
  },

  replaceSection: (id, type, variantId) => {
    if (isFixedSlotType(type)) {
      return;
    }

    const variant = findSectionVariant(type, variantId);
    if (!variant) {
      return;
    }

    set((state) => {
      const activePage = getActivePage(state);
      const sections = activePage.sections.map((section) => {
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

      return {
        site: updateActivePageSections(state.site, state.activePageId, sections),
        isDirty: true,
      };
    });
  },

  updateNavigation: (navigation) => {
    set((state) => ({
      site: { ...state.site, navigation },
      isDirty: true,
    }));
  },

  patchNavigation: (partial) => {
    set((state) => ({
      site: {
        ...state.site,
        navigation: { ...state.site.navigation, ...partial },
      },
      isDirty: true,
    }));
  },

  updateNavigationSettings: (partialSettings) => {
    set((state) => ({
      site: {
        ...state.site,
        navigation: {
          ...state.site.navigation,
          settings: { ...(state.site.navigation.settings ?? {}), ...partialSettings },
        },
      },
      isDirty: true,
    }));
  },

  updateFooter: (footer) => {
    set((state) => ({
      site: { ...state.site, footer },
      isDirty: true,
    }));
  },

  patchFooterProps: (partial) => {
    set((state) => ({
      site: {
        ...state.site,
        footer: {
          ...state.site.footer,
          props: { ...state.site.footer.props, ...partial },
        },
      },
      isDirty: true,
    }));
  },

  updateFooterSettings: (partialSettings) => {
    set((state) => ({
      site: {
        ...state.site,
        footer: {
          ...state.site.footer,
          settings: { ...(state.site.footer.settings ?? {}), ...partialSettings },
        },
      },
      isDirty: true,
    }));
  },

  replaceHeaderVariant: (variantId) => {
    const variant = findSectionVariant("header", variantId);
    if (!variant) {
      return;
    }

    set((state) => ({
      site: {
        ...state.site,
        navigation: {
          ...(structuredClone(variant.defaultProps) as unknown as NavigationConfig),
          variant: variantId,
          settings: buildVariantSettings(variant.traits, variant.settingsDefaults),
        },
      },
      isDirty: true,
    }));
  },

  replaceFooterVariant: (variantId) => {
    const variant = findSectionVariant("footer", variantId);
    if (!variant) {
      return;
    }

    set((state) => ({
      site: {
        ...state.site,
        footer: {
          variant: variantId,
          props: structuredClone(variant.defaultProps),
          settings: buildVariantSettings(variant.traits, variant.settingsDefaults),
        },
      },
      isDirty: true,
    }));
  },
}));
