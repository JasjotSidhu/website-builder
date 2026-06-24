import { z } from "zod";
import { heroButtonSchema } from "@/components/sections/hero/schema-centered";

export const ctaBannerSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  buttons: z.array(heroButtonSchema).min(1).max(1),
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
