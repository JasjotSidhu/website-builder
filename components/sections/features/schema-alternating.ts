import { z } from "zod";

export const alternatingFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
});

export const featuresAlternatingSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  items: z.array(alternatingFeatureSchema).min(1),
});

export type FeaturesAlternatingProps = z.infer<typeof featuresAlternatingSchema>;
