import type { FormFieldType, FormTemplateId } from "@/lib/collections/types";

export const FIELD_TYPE_META: Record<
  FormFieldType,
  { label: string; shortLabel: string; description: string }
> = {
  text: { label: "Text", shortLabel: "Text", description: "Single-line text input" },
  email: { label: "Email", shortLabel: "Email", description: "Email address with validation" },
  phone: { label: "Phone", shortLabel: "Phone", description: "Phone number" },
  textarea: { label: "Long text", shortLabel: "Long text", description: "Multi-line message box" },
  select: { label: "Dropdown", shortLabel: "Dropdown", description: "Choose one option" },
  checkbox: { label: "Checkbox", shortLabel: "Checkbox", description: "Yes / no toggle" },
  date: { label: "Date", shortLabel: "Date", description: "Date picker" },
  time: { label: "Time", shortLabel: "Time", description: "Time picker" },
  number: { label: "Number", shortLabel: "Number", description: "Numeric input" },
};

export const QUICK_ADD_FIELD_TYPES: FormFieldType[] = [
  "text",
  "email",
  "phone",
  "textarea",
  "select",
  "date",
  "time",
  "checkbox",
  "number",
];

export const TEMPLATE_UI_META: Record<
  FormTemplateId,
  { accent: string; recommended?: boolean }
> = {
  contact: { accent: "blue", recommended: true },
  "booking-salon": { accent: "rose" },
  newsletter: { accent: "violet" },
  custom: { accent: "neutral" },
};
