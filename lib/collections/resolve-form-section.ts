import { collectionItemToForm, findFormById } from "@/lib/forms/forms";
import type { SectionInstance, WebsiteData } from "@/lib/types";

export function resolveFormSectionProps(
  site: WebsiteData,
  section: SectionInstance,
): Record<string, unknown> {
  const formId = typeof section.props.formId === "string" ? section.props.formId : "";
  const form = formId ? findFormById(site, formId) : null;

  return {
    ...section.props,
    form: form ? collectionItemToForm(form) : null,
  };
}
