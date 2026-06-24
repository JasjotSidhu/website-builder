import { z } from "zod";
import { linkValueSchema } from "@/lib/schemas";

export const ctaBannerSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  button: z.object({
    label: z.string().min(1),
    link: linkValueSchema,
  }),
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
