"use client";

import { useState } from "react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import { useSiteContext } from "@/lib/editor/SiteContext";
import { useSectionData } from "@/lib/editor/SectionDataContext";
import type { FormDisplayItem } from "@/lib/forms/forms";
import type { FormField } from "@/lib/collections/types";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { formSectionSchema } from "./schema";
export type { FormSectionProps } from "./schema";

function FormFieldInput({
  field,
  value,
  disabled,
  onChange,
}: {
  field: FormField;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const common = {
    id: field.id,
    name: field.id,
    required: field.required,
    disabled,
    placeholder: field.placeholder,
    className: "site-form__input",
  };

  if (field.type === "textarea") {
    return (
      <textarea
        {...common}
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        {...common}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="site-form__checkbox">
        <input
          type="checkbox"
          id={field.id}
          name={field.id}
          checked={value === "true"}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked ? "true" : "")}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "phone"
        ? "tel"
        : field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : field.type === "time"
              ? "time"
              : "text";

  return (
    <input
      type={inputType}
      {...common}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function FormSection() {
  const { isEditing } = useEditMode();
  const { websiteSlug, websiteId } = useSiteContext();
  const { data } = useSectionData();
  const form = (data.form as FormDisplayItem | null | undefined) ?? null;
  const anchorId = typeof data.anchorId === "string" ? data.anchorId : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing || !form || !websiteSlug) {
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/w/${websiteSlug}/forms/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to submit form.");
      }

      setStatus("success");
      setValues({});
      if (form.settings.redirectUrl) {
        window.location.href = form.settings.redirectUrl;
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit form.");
    }
  };

  const dashboardHref = websiteId ? `/dashboard/sites/${websiteId}/forms` : undefined;

  return (
    <SectionShell>
      <div
        id={anchorId || undefined}
        className="site-form-section mx-auto max-w-3xl px-4 py-10 @sm:px-6 @lg:px-8"
      >
        <div className="mb-8 flex justify-center">
          <SectionHeader align="center" eyebrowFallback="Contact" />
        </div>

        {isEditing && !form ? (
          <div className="site-form__empty">
            <p>No form selected. Choose a form in section settings or create one in the dashboard.</p>
            {dashboardHref ? (
              <a href={dashboardHref} className="dash-btn dash-btn--orange site-manage__action-btn">
                Manage forms
              </a>
            ) : null}
          </div>
        ) : null}

        {form ? (
          <>
            {isEditing ? (
              <p className="site-form__edit-hint">
                Form fields are managed in the{" "}
                {dashboardHref ? (
                  <a href={dashboardHref} target="_blank" rel="noopener noreferrer">
                    Forms dashboard
                  </a>
                ) : (
                  "Forms dashboard"
                )}
                . Preview below.
              </p>
            ) : null}

            {status === "success" ? (
              <p className="site-form__success" role="status">
                {form.settings.successMessage}
              </p>
            ) : (
              <form className="site-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
                <input type="text" name="_hp" className="sr-only" tabIndex={-1} autoComplete="off" />
                <div className="site-form__fields">
                  {form.fields.map((field) =>
                    field.type === "checkbox" ? (
                      <div key={field.id} className="site-form__field site-form__field--full">
                        <FormFieldInput
                          field={field}
                          value={values[field.id] ?? ""}
                          disabled={isEditing || status === "submitting"}
                          onChange={(value) =>
                            setValues((current) => ({ ...current, [field.id]: value }))
                          }
                        />
                      </div>
                    ) : (
                      <div
                        key={field.id}
                        className={`site-form__field${field.width === "half" ? " site-form__field--half" : " site-form__field--full"}`}
                      >
                        <label htmlFor={field.id} className="site-form__label">
                          {field.label}
                          {field.required ? <span className="site-form__required">*</span> : null}
                        </label>
                        <FormFieldInput
                          field={field}
                          value={values[field.id] ?? ""}
                          disabled={isEditing || status === "submitting"}
                          onChange={(value) =>
                            setValues((current) => ({ ...current, [field.id]: value }))
                          }
                        />
                      </div>
                    ),
                  )}
                </div>

                {errorMessage ? <p className="site-form__error">{errorMessage}</p> : null}

                <button
                  type="submit"
                  className="dash-btn dash-btn--orange site-manage__action-btn site-form__submit"
                  disabled={isEditing || status === "submitting"}
                >
                  {status === "submitting" ? "Sending…" : form.settings.submitLabel}
                </button>
              </form>
            )}
          </>
        ) : null}
      </div>
    </SectionShell>
  );
}
