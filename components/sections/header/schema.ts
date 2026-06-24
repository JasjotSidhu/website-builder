import { z } from "zod";

export const headerSimpleSchema = z.object({
  logo: z.object({
    type: z.enum(["text", "image"]),
    value: z.string().min(1),
  }),
  links: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
  ),
  cta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
});

export type HeaderSimpleProps = z.infer<typeof headerSimpleSchema>;
