import { z } from "zod";
import { heroButtonSchema } from "./schema-centered";

export const heroMinimalSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().min(1),
  buttons: z.array(heroButtonSchema).min(0).max(6),
});

export type HeroMinimalProps = z.infer<typeof heroMinimalSchema>;
