import { z } from "zod";
import type { LinkValue } from "./types";

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

export const themeConfigSchema = z.object({
  colors: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    background: z.string().min(1),
    text: z.string().min(1),
    accent: z.string().optional(),
  }),
  fonts: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  spacing: z.enum(["compact", "comfortable", "spacious"]),
});

export const navigationConfigSchema = z.object({
  variant: z.string().optional(),
  logo: z.object({
    type: z.enum(["text", "image"]),
    value: z.string().min(1),
  }),
  links: z.array(
    z.object({
      label: z.string().min(1),
      link: linkValueSchema,
    }),
  ),
  cta: z
    .object({
      label: z.string().min(1),
      link: linkValueSchema,
      variant: z.enum(["primary", "secondary"]).optional(),
    })
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
  hidden: z.boolean().optional(),
  style: sectionStyleSchema,
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

export const websiteSchema = z.object({
  siteId: z.string().min(1),
  meta: siteMetaSchema,
  theme: themeConfigSchema,
  navigation: navigationConfigSchema,
  pages: z.array(pageDataSchema),
  footer: footerConfigSchema,
});

export type { LinkValue };
