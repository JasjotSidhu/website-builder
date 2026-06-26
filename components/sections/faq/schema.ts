import { z } from "zod";
import { sectionDataSourceSchema } from "@/lib/collections/schemas";

export const faqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqAccordionSchema = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().min(1),
    subheading: z.string().optional(),
    dataSource: sectionDataSourceSchema.optional(),
    faqs: z.array(faqItemSchema).max(24).optional(),
  })
  .superRefine((data, ctx) => {
    const mode = data.dataSource?.mode ?? "inline";
    if (mode === "inline" && (!data.faqs || data.faqs.length < 1)) {
      ctx.addIssue({
        code: "custom",
        message: "At least one FAQ is required in inline mode.",
        path: ["faqs"],
      });
    }
  });

export type FaqAccordionProps = z.infer<typeof faqAccordionSchema>;
