import { z } from "zod";
import { heroButtonSchema } from "./schema-centered";

export const heroSplitSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  buttons: z.array(heroButtonSchema).min(0).max(6),
});

export type HeroSplitProps = z.infer<typeof heroSplitSchema>;
