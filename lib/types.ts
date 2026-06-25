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

export interface WebsiteData {
  siteId: string;
  meta: SiteMeta;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  pages: PageData[];
  footer: FooterConfig;
  savedSections?: SavedSection[];
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

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  spacing: "compact" | "comfortable" | "spacious";
}

export interface NavigationConfig {
  variant?: string;
  logo: { type: "image"; value: string };
  links?: { label: string; link: LinkValue }[];
  menus?: HeaderMenuItem[];
  cta?: { label: string; link: LinkValue; variant?: "primary" | "secondary" };
  ctas?: { id: string; label: string; link: LinkValue; variant?: "primary" | "secondary" }[];
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
