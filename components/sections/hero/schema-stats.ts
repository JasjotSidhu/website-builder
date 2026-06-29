import { z } from "zod";
import { heroButtonSchema } from "./schema-centered";

export const heroStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const heroStatsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().min(1),
  buttons: z.array(heroButtonSchema).min(0).max(6),
  stats: z.array(heroStatSchema).min(1).max(4),
});

export type HeroStatsProps = z.infer<typeof heroStatsSchema>;
