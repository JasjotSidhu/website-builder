import type { LinkValue, NavigationConfig } from "@/lib/types";

export function hrefToLink(href: string): LinkValue {
  return { type: "url", href };
}

type LegacyNavLink = {
  label: string;
  href?: string;
  link?: LinkValue;
};

export function migrateNavLink(link: LegacyNavLink) {
  if (link.link) {
    return { label: link.label, link: link.link };
  }

  return { label: link.label, link: hrefToLink(link.href ?? "#") };
}

export function migrateNavigation(navigation: NavigationConfig): NavigationConfig {
  return {
    ...navigation,
    links: navigation.links.map((link) => migrateNavLink(link as LegacyNavLink)),
    cta: navigation.cta
      ? {
          label: navigation.cta.label,
          link:
            "link" in navigation.cta && navigation.cta.link
              ? navigation.cta.link
              : hrefToLink(
                  "href" in navigation.cta ? String(navigation.cta.href ?? "#") : "#",
                ),
          variant:
            "variant" in navigation.cta
              ? (navigation.cta.variant as "primary" | "secondary" | undefined)
              : "primary",
        }
      : undefined,
  };
}

export function migrateFooterProps(props: Record<string, unknown>): Record<string, unknown> {
  const columns = props.columns;
  if (!Array.isArray(columns)) {
    return props;
  }

  return {
    ...props,
    columns: columns.map((column) => {
      if (!column || typeof column !== "object") {
        return column;
      }

      const entry = column as { title?: string; links?: LegacyNavLink[] };
      return {
        ...entry,
        links: Array.isArray(entry.links)
          ? entry.links.map((link) => migrateNavLink(link))
          : entry.links,
      };
    }),
  };
}

export function migrateSectionProps(
  type: string,
  variant: string,
  props: Record<string, unknown>,
): Record<string, unknown> {
  if (type === "cta" && variant === "cta-banner" && props.button && !props.buttons) {
    const button = props.button as {
      label: string;
      link: LinkValue;
      variant?: "primary" | "secondary";
    };
    const { button: _removed, ...rest } = props;
    return {
      ...rest,
      buttons: [
        {
          label: button.label,
          link: button.link,
          variant: button.variant ?? "primary",
        },
      ],
    };
  }

  return props;
}
