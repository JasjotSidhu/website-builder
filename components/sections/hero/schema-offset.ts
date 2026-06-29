import { z } from "zod";
import { heroButtonSchema } from "./schema-centered";

export const heroOffsetSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  imageTitle: z.string().optional(),
  buttons: z.array(heroButtonSchema).min(0).max(6),
});

export type HeroOffsetProps = z.infer<typeof heroOffsetSchema>;
