import { z } from "zod";
import { linkValueSchema } from "@/lib/schemas";
import { normalizeButtonVariant } from "@/lib/button-styles";

const buttonVariantSchema = z.preprocess(
  (value) => normalizeButtonVariant(value),
  z.enum(["primary", "secondary", "outline", "light"]),
);

export const heroButtonSchema = z.object({
  label: z.string().min(1),
  link: linkValueSchema,
  variant: buttonVariantSchema.default("primary"),
});

export const heroCenteredSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  imageTitle: z.string().optional(),
  buttons: z.array(heroButtonSchema).min(0).max(6),
});

export type HeroCenteredProps = z.infer<typeof heroCenteredSchema>;
