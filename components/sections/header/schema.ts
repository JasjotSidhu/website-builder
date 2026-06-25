import { z } from "zod";
import { linkValueSchema } from "@/lib/schemas";

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
      variant: z.enum(["primary", "secondary"]).optional(),
    })
    .optional(),
  ctas: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        link: linkValueSchema,
        variant: z.enum(["primary", "secondary"]).optional(),
      }),
    )
    .optional(),
});

export type HeaderSimpleProps = z.infer<typeof headerSimpleSchema>;
