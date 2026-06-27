import { z } from "zod";

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "text",
    "email",
    "phone",
    "textarea",
    "select",
    "checkbox",
    "date",
    "time",
    "number",
  ]),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  width: z.enum(["full", "half"]).optional(),
});

const formDisplaySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  templateId: z.enum(["contact", "booking-salon", "newsletter", "custom"]).optional(),
  fields: z.array(formFieldSchema),
  settings: z.object({
    submitLabel: z.string(),
    successMessage: z.string(),
    redirectUrl: z.string().optional(),
  }),
});

export const formSectionSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  formId: z.string().optional(),
  anchorId: z.string().optional(),
  /** Resolved at render time from site.collections — must survive strict validation on publish. */
  form: formDisplaySchema.nullable().optional(),
});

export type FormSectionProps = z.infer<typeof formSectionSchema>;
