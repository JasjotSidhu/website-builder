import { z } from "zod";
import { FEATURE_ICON_IDS } from "@/lib/feature-icons";

export const featureItemSchema = z.object({
  icon: z.enum(FEATURE_ICON_IDS),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const featuresGrid3Schema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  items: z.array(featureItemSchema).min(1).max(6),
});

export type FeaturesGrid3Props = z.infer<typeof featuresGrid3Schema>;
