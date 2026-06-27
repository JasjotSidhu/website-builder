"use client";

import type { FormDisplayItem } from "@/lib/forms/forms";
import type { FormField } from "@/lib/collections/types";

function PreviewField({ field }: { field: FormField }) {
  const common = {
    disabled: true,
    className: "site-form__input form-preview__input",
    placeholder: field.placeholder || field.label,
  };

  if (field.type === "textarea") {
    return <textarea {...common} rows={3} defaultValue="" />;
  }

  if (field.type === "select") {
    return (
      <select {...common} defaultValue="">
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
      <label className="site-form__checkbox form-preview__checkbox">
        <input type="checkbox" disabled />
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

  return <input type={inputType} {...common} defaultValue="" />;
}

export default function FormPreview({ form }: { form: FormDisplayItem }) {
  return (
    <div className="form-preview" aria-label="Form preview">
      <p className="form-preview__label">Live preview</p>
      <div className="form-preview__frame">
        {form.fields.length === 0 ? (
          <p className="form-preview__empty">Add fields to see a preview.</p>
        ) : (
          <div className="site-form__fields form-preview__fields">
            {form.fields.map((field) =>
              field.type === "checkbox" ? (
                <div key={field.id} className="site-form__field site-form__field--full">
                  <PreviewField field={field} />
                </div>
              ) : (
                <div
                  key={field.id}
                  className={`site-form__field${field.width === "half" ? " site-form__field--half" : " site-form__field--full"}`}
                >
                  <span className="site-form__label">
                    {field.label}
                    {field.required ? <span className="site-form__required">*</span> : null}
                  </span>
                  <PreviewField field={field} />
                </div>
              ),
            )}
          </div>
        )}
        <button type="button" className="dash-btn dash-btn--orange site-manage__action-btn form-preview__submit" disabled>
          {form.settings.submitLabel || "Submit"}
        </button>
      </div>
    </div>
  );
}
