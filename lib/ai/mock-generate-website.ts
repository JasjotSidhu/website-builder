import type { AiColorSchemeId } from "@/lib/ai/wizard-config";
import { resolveIndustryPages } from "@/lib/ai/industries/registry";
import type { AiIndustryId, AiIndustryPageDefinition, AiSuggestedSection } from "@/lib/ai/industries/types";
import { isGenerationReadyIndustry } from "@/lib/ai/industries/types";
import {
  buildAlternatingFeaturesProps,
  buildMedicalCollections,
  buildMedicalSectionProps,
  type MedicalMockContext,
} from "@/lib/ai/mock-medical-content";
import { extractSiteNameFromPrompt } from "@/lib/ai/extract-site-name";
import { CURRENT_SITE_SCHEMA_VERSION } from "@/lib/collections/types";
import { findBuiltInPreset } from "@/data/theme-presets";
import { findSectionVariant, type SectionVariant } from "@/lib/registry";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";
import { cloneTheme } from "@/lib/theme-defaults";
import type {
  FooterConfig,
  LinkValue,
  NavigationConfig,
  PageData,
  SectionInstance,
  WebsiteData,
} from "@/lib/types";
import { createWebsiteData } from "@/lib/website-factory";

export interface MockGenerateWebsiteInput {
  websiteId: string;
  name?: string;
  industryId: AiIndustryId;
  prompt: string;
  selectedPageIds: string[];
  colorScheme?: AiColorSchemeId;
}

const COLOR_SCHEME_PRESETS: Record<AiColorSchemeId, string> = {
  blue: "professional",
  purple: "atelier",
  green: "forest",
  orange: "warm",
  pink: "warm",
  neutral: "minimal",
};

function cloneRecord<T extends Record<string, unknown>>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

function sectionId(pageId: string, type: string, index: number): string {
  return `${pageId}-${type}-${index + 1}`;
}

function defaultSectionSettings(variant: SectionVariant): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: "solid",
    color: "var(--color-background)",
    paddingY: "lg",
    textColor: "auto",
  };

  if (variant.traits.includes("grid")) {
    base.columns = 3;
    base.gap = "md";
  }

  return {
    ...base,
    ...(variant.settingsDefaults ?? {}),
  };
}

function pageLink(pageId: string): LinkValue {
  return { type: "page", pageId };
}

function buildSection(
  page: AiIndustryPageDefinition,
  suggested: AiSuggestedSection,
  index: number,
  ctx: MedicalMockContext,
): SectionInstance | null {
  const variant = findSectionVariant(suggested.type, suggested.variant);
  if (!variant) {
    return null;
  }

  const props = cloneRecord(variant.defaultProps);
  const medicalProps = buildMedicalSectionProps(page, suggested, ctx);

  if (suggested.type === "features" && suggested.variant === "features-alternating") {
    Object.assign(props, buildAlternatingFeaturesProps(ctx.siteName));
  } else {
    Object.assign(props, medicalProps);
  }

  return {
    id: sectionId(page.id, suggested.type, index),
    type: suggested.type,
    variant: suggested.variant,
    props,
    settings: defaultSectionSettings(variant),
  };
}

function buildNavigation(pages: AiIndustryPageDefinition[], siteName: string): NavigationConfig {
  const links = pages
    .filter((page) => page.id !== "home")
    .map((page) => ({
      label: page.navLabel ?? page.label,
      link: pageLink(page.id),
    }));

  const ctaPage = pages.find((page) => page.id === "appointments") ?? pages.find((page) => page.id === "contact");

  return {
    variant: "header-simple",
    logo: { type: "text", value: siteName },
    links,
    cta: ctaPage
      ? {
          label: ctaPage.id === "appointments" ? "Book now" : "Contact",
          link: pageLink(ctaPage.id),
          variant: "primary",
        }
      : undefined,
  };
}

function buildFooter(pages: AiIndustryPageDefinition[], siteName: string): FooterConfig {
  const variant = findSectionVariant("footer", "footer-simple");
  const props = cloneRecord(variant?.defaultProps ?? {});

  props.logo = { type: "text", value: siteName };
  props.blurb = `Compassionate medical care for patients and families at ${siteName}.`;
  props.columns = [
    {
      title: "Pages",
      links: pages.slice(0, 4).map((page) => ({
        label: page.navLabel ?? page.label,
        link: pageLink(page.id),
      })),
    },
    {
      title: "Hours",
      links: [{ label: "Mon–Fri 8am–5pm", link: { type: "url", href: "#" } }],
    },
  ];
  props.copyright = `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  return {
    variant: "footer-simple",
    props,
    settings: variant?.settingsDefaults ?? { type: "solid", color: "var(--color-background)" },
  };
}

function resolveTheme(colorScheme?: AiColorSchemeId) {
  const presetId = colorScheme ? COLOR_SCHEME_PRESETS[colorScheme] : "professional";
  const preset = findBuiltInPreset(presetId) ?? findBuiltInPreset("professional");
  if (!preset) {
    return cloneTheme({});
  }

  return {
    ...cloneTheme(preset.theme),
    presetId: preset.id,
  };
}

function mockGenerateMedicalWebsite(input: MockGenerateWebsiteInput): WebsiteData {
  const siteName = input.name?.trim() || extractSiteNameFromPrompt(input.prompt, input.industryId);
  const pages = resolveIndustryPages(input.industryId, input.selectedPageIds);
  const now = nowIso();
  const ctx: MedicalMockContext = {
    siteName,
    prompt: input.prompt,
    pages,
  };

  const sitePages: PageData[] = pages.map((page) => {
    const sections = page.suggestedSections
      .map((suggested, index) => buildSection(page, suggested, index, ctx))
      .filter((section): section is SectionInstance => section !== null);

    return {
      id: page.id,
      slug: page.slug,
      title: page.label,
      seo: {
        title: `${page.label} — ${siteName}`,
        description: page.purpose,
      },
      sections,
    };
  });

  const collections = buildMedicalCollections(now);
  const theme = resolveTheme(input.colorScheme);
  const seoDescription =
    input.prompt.trim() ||
    `${siteName} provides trusted medical care with experienced providers and a patient-first approach.`;

  return parseAndMigrateWebsiteData({
    siteId: input.websiteId,
    schemaVersion: CURRENT_SITE_SCHEMA_VERSION,
    meta: {
      name: siteName,
      seo: {
        title: siteName,
        description: seoDescription.slice(0, 160),
      },
    },
    theme,
    navigation: buildNavigation(pages, siteName),
    pages: sitePages,
    footer: buildFooter(pages, siteName),
    collections,
  });
}

export function mockGenerateWebsite(input: MockGenerateWebsiteInput): WebsiteData {
  if (!isGenerationReadyIndustry(input.industryId)) {
    const fallbackName = input.name?.trim() || extractSiteNameFromPrompt(input.prompt, input.industryId);
    return createWebsiteData(input.websiteId, fallbackName);
  }

  if (input.industryId === "medical") {
    return mockGenerateMedicalWebsite(input);
  }

  return createWebsiteData(
    input.websiteId,
    input.name?.trim() || extractSiteNameFromPrompt(input.prompt, input.industryId),
  );
}