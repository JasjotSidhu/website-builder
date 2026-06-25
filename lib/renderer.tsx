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
import { getHeaderProps } from "./header-utils";
import GoogleFontsLoader from "@/components/shared/GoogleFontsLoader";
import { ThemeProvider } from "@/lib/editor/ThemeContext";
import { collectSiteFonts } from "@/lib/fonts/collect-site-fonts";
import { buildThemeCssVariables, buildSectionTypographyStyle } from "./theme-utils";
import HeaderSimple from "@/components/sections/header/HeaderSimple";
import { headerSimpleSchema } from "@/components/sections/header/schema";
import { SectionDataProvider } from "@/lib/editor/SectionDataContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import { SectionSettingsProvider } from "@/lib/traits/context";
import { resolveFixedSlotSettings, resolveSectionSettings } from "@/lib/traits/normalize";

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
  const settings = resolveFixedSlotSettings(
    footer.settings,
    match.traits,
    match.settingsDefaults,
    "footer",
    footer.variant,
  );

  return (
    <SectionSettingsProvider settings={settings}>
      <SectionDataProvider data={props} updateField={() => {}} updateFields={() => {}}>
        <Component />
      </SectionDataProvider>
    </SectionSettingsProvider>
  );
}

function renderNavigation(navigation: NavigationConfig, strict: boolean) {
  const navProps = getHeaderProps(navigation);
  const result = strict
    ? headerSimpleSchema.safeParse(navProps)
    : { success: true as const, data: navProps };

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Navigation failed validation: ${issues}`);
  }

  const props = result.data as Record<string, unknown>;

  return (
    <SectionDataProvider data={props} updateField={() => {}} updateFields={() => {}}>
      <HeaderSimple />
    </SectionDataProvider>
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
          <div
            key={section.id}
            className={["section-typography", section.customClass?.trim()].filter(Boolean).join(" ") || undefined}
            style={buildSectionTypographyStyle(settings)}
          >
            <SectionSettingsProvider settings={settings}>
              <SectionDataProvider data={props} updateField={() => {}} updateFields={() => {}}>
                <Component />
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
  page,
  slug,
  strict = true,
  showHidden = false,
}: {
  site: WebsiteData;
  page?: PageData;
  slug?: string;
  strict?: boolean;
  showHidden?: boolean;
}) {
  const resolvedPage = page ?? site.pages.find((entry) => entry.slug === slug);

  if (!resolvedPage) {
    throw new Error(`No page found for slug "${slug ?? "unknown"}".`);
  }

  const pages = site.pages.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
  }));

  return (
    <SiteProvider pages={pages}>
      <GoogleFontsLoader fonts={collectSiteFonts(site)} />
      <ThemeProvider theme={site.theme}>
        <div
          className="@container site-theme-root w-full"
          style={buildThemeCssVariables(site.theme)}
          data-btn-hover-effect={site.theme.buttons?.hoverEffect ?? "lift"}
        >
          {renderNavigation(site.navigation, strict)}
          <PageRenderer
            page={resolvedPage}
            theme={site.theme}
            strict={strict}
            showHidden={showHidden}
          />
          {renderFooter(site.footer, strict)}
        </div>
      </ThemeProvider>
    </SiteProvider>
  );
}
