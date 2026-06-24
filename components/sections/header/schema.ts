import { z } from "zod";
import { linkValueSchema } from "@/lib/schemas";

export const headerSimpleSchema = z.object({
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
});

export type HeaderSimpleProps = z.infer<typeof headerSimpleSchema>;
