import type {
  HeaderMenuGroup,
  HeaderMenuItem,
  HeaderSubmenuItem,
  LinkValue,
  NavigationConfig,
} from "@/lib/types";

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

function makeId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function migrateSubmenuItems(items: unknown, prefix: string): HeaderSubmenuItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is LegacyNavLink => Boolean(item && typeof item === "object"))
    .map((item, index) => {
      const migrated = migrateNavLink(item);
      return {
        id:
          "id" in item && typeof item.id === "string" && item.id
            ? item.id
            : makeId(`${prefix}-item`, index),
        label: migrated.label,
        link: migrated.link,
      };
    });
}

function migrateMenuGroups(groups: unknown, prefix: string): HeaderMenuGroup[] {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups
    .filter(
      (group): group is { id?: string; title?: string; items?: unknown } =>
        Boolean(group && typeof group === "object"),
    )
    .map((group, index) => ({
      id: typeof group.id === "string" && group.id ? group.id : makeId(`${prefix}-group`, index),
      title: typeof group.title === "string" && group.title ? group.title : `Column ${index + 1}`,
      items: migrateSubmenuItems(group.items, `${prefix}-group-${index + 1}`),
    }))
    .filter((group) => group.items.length > 0);
}

function migrateMenuItems(
  rawMenus: unknown,
  fallbackLinks: LegacyNavLink[] | undefined,
): HeaderMenuItem[] {
  if (Array.isArray(rawMenus) && rawMenus.length > 0) {
    const migrated = rawMenus
      .filter(
        (
          menu,
        ): menu is {
          id?: string;
          type?: string;
          label?: string;
          link?: LinkValue;
          href?: string;
          items?: unknown;
          groups?: unknown;
        } => Boolean(menu && typeof menu === "object"),
      )
      .map((menu, index): HeaderMenuItem | null => {
        const id = typeof menu.id === "string" && menu.id ? menu.id : makeId("menu", index);
        const label = typeof menu.label === "string" && menu.label ? menu.label : `Menu ${index + 1}`;
        const type = menu.type;

        if (type === "single-dropdown") {
          return {
            id,
            type: "single-dropdown",
            label,
            items: migrateSubmenuItems(menu.items, id),
          };
        }

        if (type === "multi-level-dropdown") {
          return {
            id,
            type: "multi-level-dropdown",
            label,
            groups: migrateMenuGroups(menu.groups, id),
          };
        }

        const link = menu.link ?? hrefToLink(typeof menu.href === "string" ? menu.href : "#");
        return {
          id,
          type: "link",
          label,
          link,
        };
      })
      .filter((menu): menu is HeaderMenuItem => menu !== null);

    if (migrated.length > 0) {
      return migrated;
    }
  }

  const links = Array.isArray(fallbackLinks) ? fallbackLinks : [];
  return links.map((link, index) => {
    const migrated = migrateNavLink(link);
    return {
      id: makeId("menu", index),
      type: "link" as const,
      label: migrated.label,
      link: migrated.link,
    };
  });
}

export function migrateNavigation(navigation: NavigationConfig): NavigationConfig {
  const fallbackLinks = Array.isArray(navigation.links) ? navigation.links : [];
  const menus = migrateMenuItems(
    "menus" in navigation ? (navigation as { menus?: unknown }).menus : undefined,
    fallbackLinks,
  );

  const legacyCta =
    navigation.cta && "label" in navigation.cta
      ? {
          id: "cta-1",
          label: navigation.cta.label,
          link:
            "link" in navigation.cta && navigation.cta.link
              ? navigation.cta.link
              : hrefToLink("href" in navigation.cta ? String(navigation.cta.href ?? "#") : "#"),
          variant:
            "variant" in navigation.cta
              ? (navigation.cta.variant as "primary" | "secondary" | undefined)
              : "primary",
        }
      : null;
  const ctas = Array.isArray(navigation.ctas)
    ? navigation.ctas.map((cta, index) => ({
        id: cta.id || makeId("cta", index),
        label: cta.label,
        link: cta.link,
        variant: cta.variant ?? "primary",
      }))
    : legacyCta
      ? [legacyCta]
      : [];

  return {
    ...navigation,
    logo: {
      type: "image",
      value: navigation.logo?.type === "image" ? navigation.logo.value ?? "" : "",
    },
    links: fallbackLinks.map((link) => migrateNavLink(link as LegacyNavLink)),
    menus,
    ctas,
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
