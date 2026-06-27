import type { FormCollectionItem, FormField, FormTemplateId } from "@/lib/collections/types";
import { DEFAULT_FORMS_COLLECTION_ID } from "@/lib/collections/types";
import type { WebsiteData } from "@/lib/types";
import { FORM_TEMPLATES } from "./templates";

export interface FormDisplayItem {
  id: string;
  name: string;
  slug: string;
  templateId?: FormTemplateId;
  fields: FormField[];
  settings: FormCollectionItem["settings"];
}

export function slugifyFormName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "form";
}

export function getFormsFromCollection(site: WebsiteData): FormCollectionItem[] {
  const collection = site.collections?.[DEFAULT_FORMS_COLLECTION_ID];
  if (!collection || collection.type !== "forms") {
    return [];
  }

  return [...(collection.items as FormCollectionItem[])].sort((a, b) => a.order - b.order);
}

export function findFormById(site: WebsiteData, formId: string): FormCollectionItem | null {
  return getFormsFromCollection(site).find((item) => item.id === formId) ?? null;
}

export function findFormBySlug(site: WebsiteData, slug: string): FormCollectionItem | null {
  return getFormsFromCollection(site).find((item) => item.slug === slug) ?? null;
}

export function collectionItemToForm(item: FormCollectionItem): FormDisplayItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    templateId: item.templateId,
    fields: item.fields,
    settings: item.settings,
  };
}

export function createFormFromTemplate(
  templateId: FormTemplateId,
  partial?: { name?: string; slug?: string },
): FormCollectionItem {
  const template = FORM_TEMPLATES[templateId];
  const now = new Date().toISOString();
  const name = partial?.name?.trim() || template.name;
  const slug = partial?.slug?.trim() || slugifyFormName(name);

  return {
    id: `form-${crypto.randomUUID()}`,
    order: 0,
    createdAt: now,
    updatedAt: now,
    name,
    slug,
    templateId,
    fields: template.fields.map((entry, index) => ({
      ...entry,
      id: `field-${index + 1}`,
    })),
    settings: { ...template.settings },
  };
}

export function prepareFormForSave(
  draft: FormDisplayItem,
  existing?: FormCollectionItem,
): FormCollectionItem {
  const now = new Date().toISOString();
  const name = draft.name.trim() || "Untitled form";

  return {
    id: existing?.id ?? draft.id ?? `form-${crypto.randomUUID()}`,
    order: existing?.order ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    name,
    slug: draft.slug?.trim() || existing?.slug || slugifyFormName(name),
    templateId: draft.templateId ?? existing?.templateId ?? "custom",
    fields: draft.fields.map((field, index) => ({
      ...field,
      id: field.id || `field-${index + 1}`,
      label: field.label.trim() || `Field ${index + 1}`,
    })),
    settings: {
      submitLabel: draft.settings.submitLabel.trim() || "Submit",
      successMessage: draft.settings.successMessage.trim() || "Thank you for your submission.",
      redirectUrl: draft.settings.redirectUrl?.trim() || undefined,
    },
  };
}

export function validateSubmissionPayload(
  form: FormCollectionItem,
  payload: Record<string, unknown>,
): { valid: boolean; data: Record<string, string>; errors: string[] } {
  const data: Record<string, string> = {};
  const errors: string[] = [];

  for (const field of form.fields) {
    const raw = payload[field.id];
    const value = typeof raw === "string" ? raw.trim() : raw === true ? "true" : "";

    if (field.required && !value) {
      errors.push(`${field.label} is required.`);
      continue;
    }

    if (!value) {
      continue;
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${field.label} must be a valid email.`);
      continue;
    }

    if (field.type === "select" && field.options?.length && !field.options.includes(value)) {
      errors.push(`${field.label} has an invalid option.`);
      continue;
    }

    data[field.id] = value;
  }

  return { valid: errors.length === 0, data, errors };
}
