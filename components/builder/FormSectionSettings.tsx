"use client";

import { PopoverField } from "@/lib/editor/PopoverShell";
import { useBuilderStore } from "@/store/builderStore";
import { getFormsFromCollection } from "@/lib/forms/forms";

export default function FormSectionSettings({
  sectionId,
  sectionProps,
  websiteId,
}: {
  sectionId: string;
  sectionProps: Record<string, unknown>;
  websiteId?: string;
}) {
  const patchSectionProps = useBuilderStore((state) => state.patchSectionProps);
  const site = useBuilderStore((state) => state.site);
  const forms = getFormsFromCollection(site);

  const formId = typeof sectionProps.formId === "string" ? sectionProps.formId : "";
  const anchorId = typeof sectionProps.anchorId === "string" ? sectionProps.anchorId : "";

  const dashboardHref = websiteId ? `/dashboard/sites/${websiteId}/forms` : undefined;

  return (
    <section className="popover__section">
      <PopoverField
        label="Form"
        hint="Create and edit forms from the Forms page in your site dashboard."
      >
        <select
          className="popover-input"
          value={formId}
          onChange={(event) => patchSectionProps(sectionId, { formId: event.target.value })}
        >
          <option value="">Select a form…</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </PopoverField>

      <PopoverField label="Anchor ID" hint="Use for links like #contact">
        <input
          className="popover-input"
          value={anchorId}
          placeholder="contact"
          onChange={(event) =>
            patchSectionProps(sectionId, { anchorId: event.target.value || undefined })
          }
        />
      </PopoverField>

      {dashboardHref ? (
        <p className="popover__hint">
          <a href={dashboardHref} target="_blank" rel="noopener noreferrer">
            Open Forms dashboard
          </a>
        </p>
      ) : null}
    </section>
  );
}
