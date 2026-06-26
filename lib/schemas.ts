import { z } from "zod";
import type { LinkValue } from "./types";
import { normalizeFontConfig } from "./fonts/font-utils";
import { DEFAULT_BUTTON_STYLE, normalizeTheme, normalizeThemeColors } from "./theme-defaults";
import type { ThemeConfig } from "./types";

export const linkValueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page"), pageId: z.string() }),
  z.object({ type: z.literal("url"), href: z.string().min(1) }),
]);

export const siteMetaSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  favicon: z.string().optional(),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogImage: z.string().optional(),
  }),
});

export const themeFontConfigSchema = z.object({
  family: z.string().min(1),
  googleFontId: z.string().optional(),
  weights: z.string().optional(),
  fallback: z.enum(["sans-serif", "serif", "monospace"]).optional(),
});

const themeFontFieldSchema = z.preprocess(
  (value) => normalizeFontConfig(value),
  themeFontConfigSchema,
);

export const buttonStyleConfigSchema = z.object({
  fontSize: z.enum(["sm", "md", "lg"]),
  fontWeight: z.union([z.literal(500), z.literal(600), z.literal(700)]),
  padding: z.enum(["sm", "md", "lg"]),
  borderRadius: z.enum(["inherit", "none", "sm", "md", "lg", "full"]),
  hoverEffect: z.enum(["lift", "darken", "outline-fill", "none"]),
  shadow: z.boolean(),
  defaultVariant: z.enum(["primary", "secondary", "outline", "light"]),
});

export const cardStyleConfigSchema = z.object({
  background: z.string().min(1),
  titleColor: z.string().min(1),
  textColor: z.string().min(1),
  borderRadius: z.enum(["inherit", "none", "sm", "md", "lg", "full"]),
  borderColor: z.string().min(1),
  iconColor: z.string().min(1),
});

const themeColorsFieldSchema = z.preprocess(
  (value) => normalizeThemeColors(value as ThemeConfig["colors"] | undefined),
  z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    background: z.string().min(1),
    titleText: z.string().min(1),
    bodyText: z.string().min(1),
    text: z.string().optional(),
    accent: z.string().optional(),
    cardBackground: z.string().optional(),
    cardText: z.string().optional(),
  }),
);

const themeCardsFieldSchema = cardStyleConfigSchema.partial().optional();

export const themeConfigSchema = z
  .object({
    colors: themeColorsFieldSchema,
    fonts: z.object({
      heading: themeFontFieldSchema,
      body: themeFontFieldSchema,
    }),
    borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
    spacing: z.enum(["compact", "comfortable", "spacious"]),
    buttons: buttonStyleConfigSchema.optional(),
    cards: themeCardsFieldSchema,
    presetId: z.string().optional(),
    customName: z.string().optional(),
  })
  .transform((theme) => normalizeTheme(theme));

export const customThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  theme: themeConfigSchema,
  savedAt: z.string().min(1),
});

export const navigationConfigSchema = z.object({
  variant: z.string().optional(),
  logo: z.object({
    type: z.enum(["text", "image"]),
    value: z.string(),
  }),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        link: linkValueSchema,
      }),
    )
    .optional(),
  menus: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          id: z.string().min(1),
          type: z.literal("link"),
          label: z.string().min(1),
          link: linkValueSchema,
        }),
        z.object({
          id: z.string().min(1),
          type: z.literal("single-dropdown"),
          label: z.string().min(1),
          items: z.array(
            z.object({
              id: z.string().min(1),
              label: z.string().min(1),
              link: linkValueSchema,
            }),
          ),
        }),
        z.object({
          id: z.string().min(1),
          type: z.literal("multi-level-dropdown"),
          label: z.string().min(1),
          groups: z.array(
            z.object({
              id: z.string().min(1),
              title: z.string().min(1),
              items: z.array(
                z.object({
                  id: z.string().min(1),
                  label: z.string().min(1),
                  link: linkValueSchema,
                }),
              ),
            }),
          ),
        }),
      ]),
    )
    .optional(),
  cta: z
    .object({
      label: z.string().min(1),
      link: linkValueSchema,
      variant: z.enum(["primary", "secondary", "outline", "light"]).optional(),
    })
    .optional(),
  ctas: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        link: linkValueSchema,
        variant: z.enum(["primary", "secondary", "outline", "light"]).optional(),
      }),
    )
    .optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const sectionStyleSchema = z
  .object({
    background: z.string().optional(),
    paddingY: z.enum(["sm", "md", "lg", "xl"]).optional(),
    paddingX: z.enum(["sm", "md", "lg", "xl"]).optional(),
  })
  .optional();

export const sectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  variant: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()).optional(),
  customClass: z.string().optional(),
  hidden: z.boolean().optional(),
  style: sectionStyleSchema,
});

export const savedSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  variant: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()),
  customClass: z.string().optional(),
  savedAt: z.string().min(1),
});

export const pageDataSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  sections: z.array(sectionInstanceSchema),
});

export const footerConfigSchema = z.object({
  variant: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const collectionItemSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().nonnegative(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const collectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["testimonials", "team", "features", "blog"]),
  name: z.string().min(1),
  items: z.array(collectionItemSchema),
  meta: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const websiteSchema = z.object({
  siteId: z.string().min(1),
  meta: siteMetaSchema,
  theme: themeConfigSchema,
  navigation: navigationConfigSchema,
  pages: z.array(pageDataSchema),
  footer: footerConfigSchema,
  savedSections: z.array(savedSectionSchema).optional(),
  customThemes: z.array(customThemeSchema).optional(),
  schemaVersion: z.number().int().positive().optional(),
  collections: z.record(z.string(), collectionSchema).optional(),
});

export type { LinkValue };
