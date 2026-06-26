import { z } from "zod";
import { sectionDataSourceSchema } from "@/lib/collections/schemas";

export const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().optional(),
});

export const testimonialsGridSchema = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().min(1),
    subheading: z.string().optional(),
    dataSource: sectionDataSourceSchema.optional(),
    testimonials: z.array(testimonialSchema).max(6).optional(),
  })
  .superRefine((data, ctx) => {
    const mode = data.dataSource?.mode ?? "inline";
    if (mode === "inline" && (!data.testimonials || data.testimonials.length < 1)) {
      ctx.addIssue({
        code: "custom",
        message: "At least one testimonial is required in inline mode.",
        path: ["testimonials"],
      });
    }
  });

export type TestimonialsGridProps = z.infer<typeof testimonialsGridSchema>;
