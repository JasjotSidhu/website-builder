import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().optional(),
});

export const testimonialsGridSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  testimonials: z.array(testimonialSchema).length(3),
});

export type TestimonialsGridProps = z.infer<typeof testimonialsGridSchema>;
