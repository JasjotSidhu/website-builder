export type LinkValue =
  | { type: "page"; pageId: string }
  | { type: "url"; href: string };

export interface WebsiteData {
  siteId: string;
  meta: SiteMeta;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  pages: PageData[];
  footer: FooterConfig;
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
  logo: { type: "text" | "image"; value: string };
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
}

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
}
