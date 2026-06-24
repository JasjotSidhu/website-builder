import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().optional(),
});

export const testimonialsGridSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  testimonials: z.array(testimonialSchema).min(1).max(6),
});

export type TestimonialsGridProps = z.infer<typeof testimonialsGridSchema>;
