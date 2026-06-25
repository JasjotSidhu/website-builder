import { z } from "zod";
import { linkValueSchema } from "@/lib/schemas";
import { normalizeButtonVariant } from "@/lib/button-styles";

const buttonVariantSchema = z.preprocess(
  (value) => normalizeButtonVariant(value),
  z.enum(["primary", "secondary", "outline", "light"]),
);

export const headerSimpleSchema = z.object({
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
      variant: buttonVariantSchema.optional(),
    })
    .optional(),
  ctas: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        link: linkValueSchema,
        variant: buttonVariantSchema.optional(),
      }),
    )
    .optional(),
});

export type HeaderSimpleProps = z.infer<typeof headerSimpleSchema>;
