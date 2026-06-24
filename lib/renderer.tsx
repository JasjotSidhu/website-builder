"use client";

import type {
  FooterConfig,
  NavigationConfig,
  PageData,
  SectionInstance,
  ThemeConfig,
  WebsiteData,
} from "./types";
import { findSectionVariant } from "./registry";
import { buildThemeCssVariables } from "./theme-utils";
import HeaderSimple from "@/components/sections/header/HeaderSimple";
import { headerSimpleSchema } from "@/components/sections/header/schema";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { buildVariantSettings } from "@/lib/traits/registry";
import { resolveSectionSettings } from "@/lib/traits/normalize";

function validateSectionProps(section: SectionInstance, strict: boolean) {
  const match = findSectionVariant(section.type, section.variant);

  if (!match) {
    if (strict) {
      throw new Error(
        `Section "${section.id}": unknown type/variant "${section.type}/${section.variant}". Check sectionRegistry.`,
      );
    }

    return { match: null, props: section.props };
  }

  if (!strict) {
    return { match, props: section.props };
  }

  const result = match.propsSchema.safeParse(section.props);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new Error(
      `Section "${section.id}" (${section.type}/${section.variant}) failed validation: ${issues}`,
    );
  }

  return { match, props: result.data as Record<string, unknown> };
}

function renderFooter(footer: FooterConfig, strict: boolean) {
  const match = findSectionVariant("footer", footer.variant);

  if (!match) {
    if (strict) {
      throw new Error(
        `Footer: unknown variant "${footer.variant}". Check sectionRegistry.`,
      );
    }

    return null;
  }

  const result = strict
    ? match.propsSchema.safeParse(footer.props)
    : { success: true as const, data: footer.props };

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Footer (${footer.variant}) failed validation: ${issues}`);
  }

  const Component = match.component;
  const props = result.data as Record<string, unknown>;
  const settings = buildVariantSettings(match.traits, match.settingsDefaults);

  return (
    <SectionSettingsProvider settings={settings}>
      <SectionDataProvider data={props} updateField={() => {}}>
        <Component {...props} />
      </SectionDataProvider>
    </SectionSettingsProvider>
  );
}

function renderNavigation(navigation: NavigationConfig, strict: boolean) {
  const result = strict
    ? headerSimpleSchema.safeParse(navigation)
    : { success: true as const, data: navigation };

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Navigation failed validation: ${issues}`);
  }

  const headerVariant = findSectionVariant("header", "header-simple");
  const settings = headerVariant
    ? buildVariantSettings(headerVariant.traits, headerVariant.settingsDefaults)
    : {};

  return (
    <SectionSettingsProvider settings={settings}>
      <HeaderSimple {...result.data} />
    </SectionSettingsProvider>
  );
}

export function PageRenderer({
  page,
  theme: _theme,
  strict = true,
  showHidden = false,
}: {
  page: PageData;
  theme: ThemeConfig;
  strict?: boolean;
  showHidden?: boolean;
}) {
  return (
    <main>
      {page.sections.map((section) => {
        if (section.hidden && !showHidden) {
          return null;
        }

        const { match, props } = validateSectionProps(section, strict);

        if (!match) {
          return null;
        }

        const Component = match.component;
        const settings = resolveSectionSettings(
          section,
          match.traits,
          match.settingsDefaults,
        );

        return (
          <div key={section.id}>
            <SectionSettingsProvider settings={settings}>
              <SectionDataProvider data={props} updateField={() => {}}>
                <Component {...props} />
              </SectionDataProvider>
            </SectionSettingsProvider>
          </div>
        );
      })}
    </main>
  );
}

export function SiteRenderer({
  site,
  slug,
  strict = true,
  showHidden = false,
}: {
  site: WebsiteData;
  slug: string;
  strict?: boolean;
  showHidden?: boolean;
}) {
  const page = site.pages.find((entry) => entry.slug === slug);

  if (!page) {
    throw new Error(`No page found for slug "${slug}".`);
  }

  const pages = site.pages.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
  }));

  return (
    <SiteProvider pages={pages}>
      <div style={buildThemeCssVariables(site.theme)}>
        {renderNavigation(site.navigation, strict)}
        <PageRenderer
          page={page}
          theme={site.theme}
          strict={strict}
          showHidden={showHidden}
        />
        {renderFooter(site.footer, strict)}
      </div>
    </SiteProvider>
  );
}
