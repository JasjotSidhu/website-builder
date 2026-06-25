"use client";

import { create } from "zustand";
import { ZodError } from "zod";
import sampleSite from "@/data/sample-site.json";
import { findBuiltInPreset } from "@/data/theme-presets";
import { cloneTheme, normalizeTheme, normalizeThemeColors } from "@/lib/theme-defaults";
import { findSectionVariant } from "@/lib/registry";
import { normalizePageSlug, validatePageSlug } from "@/lib/page-slugs";
import { websiteSchema } from "@/lib/schemas";
import { migrateThemeBoundSectionSettings } from "@/lib/theme-color-utils";
import { buildVariantSettings } from "@/lib/traits/registry";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type {
  CustomTheme,
  FooterConfig,
  NavigationConfig,
  PageData,
  SavedSection,
  SectionInstance,
  SiteMeta,
  ThemeConfig,
  WebsiteData,
} from "@/lib/types";
import { isFixedSlotType } from "@/lib/section-placement";

export type PreviewDevice = "desktop" | "tablet" | "mobile";
export type RightSidebarTab = "theme" | "settings";
export type StyleSubTab = "themes" | "fonts" | "buttons" | "cards";
export type SettingsPanelTab = "site" | "page" | "data";
export type LeftSidebarMode = "outline" | "header-settings";

const HISTORY_LIMIT = 50;
let skipHistory = false;

function pauseHistory<T>(fn: () => T): T {
  skipHistory = true;
  try {
    return fn();
  } finally {
    skipHistory = false;
  }
}

interface BuilderState {
  site: WebsiteData;
  activePageId: string;
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isDirty: boolean;
  hasUnpublishedChanges: boolean;
  publishedAt: Date | null;
  lastSavedAt: Date | null;
  saveError: string | null;
  autosaveEnabled: boolean;
  previewDevice: PreviewDevice;
  historyPast: WebsiteData[];
  historyFuture: WebsiteData[];
  highlightedSectionId: string | null;
  rightSidebarTab: RightSidebarTab;
  styleSubTab: StyleSubTab;
  settingsPanelTab: SettingsPanelTab;
  leftSidebarMode: LeftSidebarMode;

  loadSite: () => Promise<void>;
  saveSite: () => Promise<void>;
  publishSite: () => Promise<void>;
  updateSiteMeta: (meta: Partial<SiteMeta>) => void;
  importDraft: (raw: unknown) => string | null;
  undo: () => void;
  redo: () => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  scrollToSection: (sectionId: string) => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
  setStyleSubTab: (tab: StyleSubTab) => void;
  setSettingsPanelTab: (tab: SettingsPanelTab) => void;
  openHeaderSettings: () => void;
  closeHeaderSettings: () => void;
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
  applyThemePreset: (presetId: string, source: "built-in" | "custom") => void;
  saveCustomTheme: (name: string) => void;
  removeCustomTheme: (themeId: string) => void;
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
  saveSectionPreset: (sectionId: string, name: string) => void;
  removeSavedSection: (savedId: string) => void;
  addSavedSection: (savedId: string, atIndex?: number) => void;
  updateSectionCustomClass: (sectionId: string, customClass: string) => void;
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSavedSectionId() {
  return `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function createCustomThemeId() {
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function remigrateSectionSettings(section: SectionInstance): SectionInstance {
  return {
    ...section,
    settings: migrateThemeBoundSectionSettings(
      section.settings ?? {},
      section.type,
      section.variant,
    ),
  };
}

const fallbackSite = normalizeSiteSections(
  websiteSchema.parse({
    ...sampleSite,
    theme: normalizeTheme(sampleSite.theme),
  }) as WebsiteData,
);

interface SiteLoadResponse {
  site: WebsiteData;
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
}

async function readSaveError(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as { error?: string };
    return payload.error ?? "Failed to save site";
  } catch {
    return "Failed to save site";
  }
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  site: fallbackSite,
  activePageId: fallbackSite.pages[0]?.id ?? "",
  isLoading: true,
  isSaving: false,
  isPublishing: false,
  isDirty: false,
  hasUnpublishedChanges: false,
  publishedAt: null,
  lastSavedAt: null,
  saveError: null,
  autosaveEnabled: true,
  previewDevice: "desktop",
  historyPast: [],
  historyFuture: [],
  highlightedSectionId: null,
  rightSidebarTab: "theme",
  styleSubTab: "themes",
  settingsPanelTab: "site",
  leftSidebarMode: "outline",

  loadSite: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/site");
      if (!res.ok) {
        throw new Error("Failed to load site");
      }
      const payload = (await res.json()) as SiteLoadResponse;
      const site = normalizeSiteSections(payload.site);
      pauseHistory(() => {
        set({
          site,
          activePageId: site.pages[0]?.id ?? "",
          isLoading: false,
          isDirty: false,
          hasUnpublishedChanges: payload.hasUnpublishedChanges,
          publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
          saveError: null,
          historyPast: [],
          historyFuture: [],
        });
      });
    } catch {
      set({ isLoading: false });
    }
  },

  saveSite: async () => {
    set({ isSaving: true, saveError: null });
    try {
      const { site } = get();
      const res = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      if (!res.ok) {
        throw new Error(await readSaveError(res));
      }
      const payload = (await res.json()) as { hasUnpublishedChanges?: boolean };
      set({
        isSaving: false,
        isDirty: false,
        lastSavedAt: new Date(),
        saveError: null,
        hasUnpublishedChanges: payload.hasUnpublishedChanges ?? get().hasUnpublishedChanges,
      });
    } catch (error) {
      set({
        isSaving: false,
        saveError: error instanceof Error ? error.message : "Failed to save site",
      });
    }
  },

  publishSite: async () => {
    const { isDirty, saveSite } = get();
    if (isDirty) {
      await saveSite();
      if (get().saveError) {
        return;
      }
    }

    set({ isPublishing: true, saveError: null });
    try {
      const res = await fetch("/api/site/publish", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to publish site");
      }
      const payload = (await res.json()) as {
        publishedAt?: string;
        hasUnpublishedChanges?: boolean;
      };
      set({
        isPublishing: false,
        hasUnpublishedChanges: payload.hasUnpublishedChanges ?? false,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
        saveError: null,
      });
    } catch (error) {
      set({
        isPublishing: false,
        saveError: error instanceof Error ? error.message : "Failed to publish site",
      });
    }
  },

  updateSiteMeta: (metaInput) => {
    set((state) => ({
      site: {
        ...state.site,
        meta: {
          ...state.site.meta,
          ...metaInput,
          seo: metaInput.seo
            ? { ...state.site.meta.seo, ...metaInput.seo }
            : state.site.meta.seo,
        },
      },
      isDirty: true,
    }));
  },

  importDraft: (raw) => {
    try {
      const site = normalizeSiteSections(websiteSchema.parse(raw) as WebsiteData);
      pauseHistory(() => {
        set({
          site,
          activePageId: site.pages[0]?.id ?? "",
          isDirty: true,
          historyPast: [],
          historyFuture: [],
        });
      });
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        return error.issues.map((issue) => issue.message).join("; ");
      }
      return "Invalid site JSON.";
    }
  },

  undo: () => {
    const state = get();
    if (state.historyPast.length === 0) {
      return;
    }

    const previous = state.historyPast[state.historyPast.length - 1];
    const current = structuredClone(state.site);

    pauseHistory(() => {
      set({
        site: structuredClone(previous),
        historyPast: state.historyPast.slice(0, -1),
        historyFuture: [current, ...state.historyFuture].slice(0, HISTORY_LIMIT),
        isDirty: true,
      });
    });
  },

  redo: () => {
    const state = get();
    if (state.historyFuture.length === 0) {
      return;
    }

    const next = state.historyFuture[0];
    const current = structuredClone(state.site);

    pauseHistory(() => {
      set({
        site: structuredClone(next),
        historyPast: [...state.historyPast, current].slice(-HISTORY_LIMIT),
        historyFuture: state.historyFuture.slice(1),
        isDirty: true,
      });
    });
  },

  setPreviewDevice: (device) => set({ previewDevice: device }),

  scrollToSection: (sectionId) => {
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    set({ highlightedSectionId: sectionId });
    window.setTimeout(() => {
      if (get().highlightedSectionId === sectionId) {
        set({ highlightedSectionId: null });
      }
    }, 1500);
  },

  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
  setStyleSubTab: (tab) => set({ styleSubTab: tab }),

  setSettingsPanelTab: (tab) => set({ settingsPanelTab: tab }),

  openHeaderSettings: () =>
    set({
      leftSidebarMode: "header-settings",
    }),

  closeHeaderSettings: () =>
    set({
      leftSidebarMode: "outline",
    }),

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
        theme: normalizeTheme({
          ...state.site.theme,
          ...theme,
          colors: {
            ...state.site.theme.colors,
            ...theme.colors,
          },
          fonts: {
            heading: { ...state.site.theme.fonts.heading, ...theme.fonts?.heading },
            body: { ...state.site.theme.fonts.body, ...theme.fonts?.body },
          },
          buttons: {
            ...state.site.theme.buttons,
            ...theme.buttons,
          },
          cards: {
            ...state.site.theme.cards,
            ...theme.cards,
          },
        }),
      },
      isDirty: true,
    }));
  },

  applyThemePreset: (presetId, source) => {
    set((state) => {
      const presetTheme =
        source === "built-in"
          ? findBuiltInPreset(presetId)?.theme
          : state.site.customThemes?.find((entry) => entry.id === presetId)?.theme;

      if (!presetTheme) {
        return state;
      }

      const nextTheme = normalizeTheme({
        ...state.site.theme,
        colors: normalizeThemeColors(presetTheme.colors),
        presetId,
      });

      return {
        site: {
          ...state.site,
          theme: nextTheme,
          pages: state.site.pages.map((page) => ({
            ...page,
            sections: page.sections.map(remigrateSectionSettings),
          })),
          footer: {
            ...state.site.footer,
            settings: migrateThemeBoundSectionSettings(
              state.site.footer.settings ?? {},
              "footer",
              state.site.footer.variant,
            ),
          },
        },
        isDirty: true,
      };
    });
  },

  saveCustomTheme: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    set((state) => {
      const customTheme: CustomTheme = {
        id: createCustomThemeId(),
        name: trimmedName,
        theme: cloneTheme({ colors: state.site.theme.colors }),
        savedAt: new Date().toISOString(),
      };

      return {
        site: {
          ...state.site,
          customThemes: [...(state.site.customThemes ?? []), customTheme],
        },
        isDirty: true,
      };
    });
  },

  removeCustomTheme: (themeId) => {
    set((state) => ({
      site: {
        ...state.site,
        customThemes: (state.site.customThemes ?? []).filter((entry) => entry.id !== themeId),
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

  saveSectionPreset: (sectionId, name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    set((state) => {
      const activePage = getActivePage(state);
      const section = activePage.sections.find((entry) => entry.id === sectionId);
      if (!section || isFixedSlotType(section.type)) {
        return state;
      }

      const preset: SavedSection = {
        id: createSavedSectionId(),
        name: trimmedName,
        type: section.type,
        variant: section.variant,
        props: structuredClone(section.props),
        settings: structuredClone(section.settings ?? {}),
        customClass: section.customClass,
        savedAt: new Date().toISOString(),
      };

      return {
        site: {
          ...state.site,
          savedSections: [...(state.site.savedSections ?? []), preset],
        },
        isDirty: true,
      };
    });
  },

  removeSavedSection: (savedId) => {
    set((state) => ({
      site: {
        ...state.site,
        savedSections: (state.site.savedSections ?? []).filter(
          (entry) => entry.id !== savedId,
        ),
      },
      isDirty: true,
    }));
  },

  addSavedSection: (savedId, atIndex) => {
    set((state) => {
      const preset = (state.site.savedSections ?? []).find((entry) => entry.id === savedId);
      if (!preset || isFixedSlotType(preset.type)) {
        return state;
      }

      const variant = findSectionVariant(preset.type, preset.variant);
      if (!variant) {
        return state;
      }

      const section: SectionInstance = {
        id: createSectionId(),
        type: preset.type,
        variant: preset.variant,
        props: structuredClone(preset.props),
        settings: structuredClone(preset.settings),
        customClass: preset.customClass,
      };

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

  updateSectionCustomClass: (sectionId, customClass) => {
    set((state) => {
      const activePage = getActivePage(state);
      return {
        site: updateActivePageSections(
          state.site,
          state.activePageId,
          activePage.sections.map((section) =>
            section.id === sectionId ? { ...section, customClass: customClass.trim() } : section,
          ),
        ),
        isDirty: true,
      };
    });
  },
}));

useBuilderStore.subscribe((state, prevState) => {
  if (skipHistory) {
    return;
  }

  const prevJson = JSON.stringify(prevState.site);
  const nextJson = JSON.stringify(state.site);
  if (prevJson === nextJson) {
    return;
  }

  useBuilderStore.setState((current) => ({
    historyPast: [
      ...current.historyPast.slice(-(HISTORY_LIMIT - 1)),
      structuredClone(prevState.site),
    ],
    historyFuture: [],
  }));
});
