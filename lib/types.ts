export type LinkValue =
  | { type: "page"; pageId: string }
  | { type: "url"; href: string };

export interface SavedSection {
  id: string;
  name: string;
  type: string;
  variant: string;
  props: Record<string, unknown>;
  settings: Record<string, unknown>;
  customClass?: string;
  savedAt: string;
}

import type { SiteCollections } from "@/lib/collections/types";

export interface WebsiteData {
  siteId: string;
  meta: SiteMeta;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  pages: PageData[];
  footer: FooterConfig;
  savedSections?: SavedSection[];
  customThemes?: CustomTheme[];
  /** Omitted on legacy sites; treated as 1 */
  schemaVersion?: number;
  /** Shared content pools (testimonials, team, etc.) */
  collections?: SiteCollections;
}

export interface CustomTheme {
  id: string;
  name: string;
  theme: ThemeConfig;
  savedAt: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  theme: ThemeConfig;
  builtIn?: boolean;
}

export interface SiteMeta {
  name: string;
  domain?: string;
  favicon?: string;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

export interface ThemeFontConfig {
  family: string;
  googleFontId?: string;
  weights?: string;
  fallback?: "sans-serif" | "serif" | "monospace";
}

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonHoverEffect = "lift" | "darken" | "outline-fill" | "none";
export type ButtonVariant = "primary" | "secondary" | "outline" | "light";

export interface ButtonStyleConfig {
  fontSize: ButtonSize;
  fontWeight: 500 | 600 | 700;
  padding: ButtonSize;
  borderRadius: "inherit" | "none" | "sm" | "md" | "lg" | "full";
  hoverEffect: ButtonHoverEffect;
  shadow: boolean;
  defaultVariant: ButtonVariant;
}

export interface CardStyleConfig {
  background: string;
  titleColor: string;
  textColor: string;
  borderRadius: "inherit" | "none" | "sm" | "md" | "lg" | "full";
  borderColor: string;
  iconColor: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    titleText: string;
    bodyText: string;
    accent?: string;
    /** @deprecated Use bodyText — kept for legacy site data */
    text?: string;
    /** @deprecated Migrated to theme.cards — kept for legacy site data */
    cardBackground?: string;
    /** @deprecated Migrated to theme.cards — kept for legacy site data */
    cardText?: string;
  };
  fonts: {
    heading: ThemeFontConfig;
    body: ThemeFontConfig;
  };
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  spacing: "compact" | "comfortable" | "spacious";
  buttons: ButtonStyleConfig;
  cards: CardStyleConfig;
  presetId?: string;
  customName?: string;
}

export interface NavigationConfig {
  variant?: string;
  logo: { type: "text" | "image"; value: string };
  links?: { label: string; link: LinkValue }[];
  menus?: HeaderMenuItem[];
  cta?: { label: string; link: LinkValue; variant?: ButtonVariant };
  ctas?: { id: string; label: string; link: LinkValue; variant?: ButtonVariant }[];
  settings?: Record<string, unknown>;
}

export interface HeaderSubmenuItem {
  id: string;
  label: string;
  link: LinkValue;
}

export interface HeaderMenuGroup {
  id: string;
  title: string;
  items: HeaderSubmenuItem[];
}

export type HeaderMenuItem =
  | {
      id: string;
      type: "link";
      label: string;
      link: LinkValue;
    }
  | {
      id: string;
      type: "single-dropdown";
      label: string;
      items: HeaderSubmenuItem[];
    }
  | {
      id: string;
      type: "multi-level-dropdown";
      label: string;
      groups: HeaderMenuGroup[];
    };

export interface PageData {
  id: string;
  slug: string;
  title: string;
  seo?: { title?: string; description?: string };
  sections: SectionInstance[];
}

export interface SectionInstance {
  id: string;
  type: string;
  variant: string;
  props: Record<string, unknown>;
  settings: Record<string, unknown>;
  customClass?: string;
  hidden?: boolean;
  style?: {
    background?: string;
    paddingY?: "sm" | "md" | "lg" | "xl";
    paddingX?: "sm" | "md" | "lg" | "xl";
  };
}

export interface FooterConfig {
  variant: string;
  props: Record<string, unknown>;
  settings?: Record<string, unknown>;
}
