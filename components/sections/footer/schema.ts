import { z } from "zod";

export const footerSimpleSchema = z.object({
  logo: z.object({
    type: z.enum(["text", "image"]),
    value: z.string().min(1),
  }),
  blurb: z.string().min(1),
  columns: z
    .array(
      z.object({
        title: z.string().min(1),
        links: z.array(
          z.object({
            label: z.string().min(1),
            href: z.string().min(1),
          }),
        ),
      }),
    )
    .min(2)
    .max(3),
  copyright: z.string().min(1),
});

export type FooterSimpleProps = z.infer<typeof footerSimpleSchema>;
